import os
import json
import numpy as np
import faiss
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
from sklearn.feature_extraction.text import TfidfVectorizer
from app.database.connection import get_database

class Embeddings(ABC):
    """Abstract base class for embeddings."""
    
    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed search docs."""
        pass
    
    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Embed query text."""
        pass

class GroqEmbeddings(Embeddings):
    """Simple TF-IDF based embeddings as a placeholder for Groq embeddings."""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=384, stop_words='english')
        self.is_fitted = False
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents using TF-IDF."""
        if not self.is_fitted:
            # Fit the vectorizer on the documents
            self.vectorizer.fit(texts)
            self.is_fitted = True
        
        # Transform texts to vectors
        vectors = self.vectorizer.transform(texts).toarray()
        return vectors.tolist()
    
    def embed_query(self, text: str) -> List[float]:
        """Embed a single query using TF-IDF."""
        if not self.is_fitted:
            # If not fitted, return a zero vector
            return [0.0] * 384
        
        vector = self.vectorizer.transform([text]).toarray()[0]
        return vector.tolist()

class VectorStore:
    """FAISS-based vector store for semantic search of PD resources."""
    
    def __init__(self, embedding_model: Optional[Embeddings] = None):
        self.embedding_model = embedding_model or GroqEmbeddings()
        self.index = None
        self.documents = []
        self.metadata = []
        self.dimension = 384  # TF-IDF feature dimension
        
    def add_documents(self, documents: List[Dict[str, Any]]):
        """Add documents to the vector store."""
        # Extract text content for embedding
        texts = []
        for doc in documents:
            # Combine title, description, and tags for embedding
            text_parts = [
                doc.get('title', ''),
                doc.get('description', ''),
                ' '.join(doc.get('tags', []))
            ]
            text = ' '.join(filter(None, text_parts))
            texts.append(text)
        
        # Generate embeddings
        embeddings = self.embedding_model.embed_documents(texts)
        
        # Initialize or update FAISS index
        if self.index is None:
            self.dimension = len(embeddings[0])
            self.index = faiss.IndexFlatIP(self.dimension)  # Inner product for cosine similarity
        
        # Normalize embeddings for cosine similarity
        embeddings_array = np.array(embeddings, dtype=np.float32)
        faiss.normalize_L2(embeddings_array)
        
        # Add to index
        self.index.add(embeddings_array)
        
        # Store documents and metadata
        self.documents.extend(texts)
        self.metadata.extend(documents)
    
    def search(self, query: str, k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Search for similar documents."""
        if self.index is None or self.index.ntotal == 0:
            return []
        
        # Generate query embedding
        query_embedding = self.embedding_model.embed_query(query)
        query_vector = np.array([query_embedding], dtype=np.float32)
        faiss.normalize_L2(query_vector)
        
        # Search
        scores, indices = self.index.search(query_vector, min(k * 2, self.index.ntotal))
        
        # Filter results
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:  # Invalid index
                continue
                
            doc = self.metadata[idx].copy()
            doc['similarity_score'] = float(score)
            
            # Apply filters
            if self._matches_filters(doc, filters):
                results.append(doc)
                
            if len(results) >= k:
                break
        
        return results
    
    def _matches_filters(self, document: Dict[str, Any], filters: Optional[Dict[str, Any]]) -> bool:
        """Check if document matches the given filters."""
        if not filters:
            return True
        
        for key, value in filters.items():
            if key not in document:
                continue
                
            doc_value = document[key]
            
            if key in ['subjects', 'grade_levels', 'tags']:
                # For list fields, check if any filter value is in the document list
                if isinstance(value, list):
                    if not any(v in doc_value for v in value if doc_value):
                        return False
                else:
                    if doc_value and value not in doc_value:
                        return False
            elif key == 'cost':
                # Handle cost filtering
                if value == 'free' and document.get('cost', 0) != 0:
                    return False
                elif value == 'paid' and document.get('cost', 0) == 0:
                    return False
            else:
                # Exact match for other fields
                if doc_value != value:
                    return False
        
        return True
    
    def save_index(self, filepath: str):
        """Save the FAISS index to disk."""
        if self.index is not None:
            faiss.write_index(self.index, filepath)
            
            # Save metadata
            metadata_path = filepath.replace('.index', '_metadata.json')
            with open(metadata_path, 'w') as f:
                json.dump({
                    'documents': self.documents,
                    'metadata': self.metadata,
                    'dimension': self.dimension
                }, f)
    
    def load_index(self, filepath: str):
        """Load the FAISS index from disk."""
        if os.path.exists(filepath):
            self.index = faiss.read_index(filepath)
            
            # Load metadata
            metadata_path = filepath.replace('.index', '_metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r') as f:
                    data = json.load(f)
                    self.documents = data.get('documents', [])
                    self.metadata = data.get('metadata', [])
                    self.dimension = data.get('dimension', 384)
    
    async def rebuild_from_database(self):
        """Rebuild the vector store from the database."""
        db = await get_database()
        resources_collection = db.resources
        
        # Clear existing data
        self.index = None
        self.documents = []
        self.metadata = []
        
        # Fetch all resources
        resources = await resources_collection.find({}).to_list(length=None)
        
        if resources:
            # Convert ObjectId to string for JSON serialization
            for resource in resources:
                if '_id' in resource:
                    resource['_id'] = str(resource['_id'])
            
            self.add_documents(resources)
            
            # Save the updated index
            os.makedirs('data', exist_ok=True)
            self.save_index('data/vector_store.index')
        
        return len(resources)