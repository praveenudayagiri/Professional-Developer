import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None

database = Database()

async def get_database():
    return database.database

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/pd_coach")
        database.client = AsyncIOMotorClient(mongo_uri)
        database.database = database.client.get_database()
        
        # Test the connection
        await database.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()
        logger.info("Disconnected from MongoDB")

# Synchronous client for vector store operations
def get_sync_database():
    """Get synchronous MongoDB client for vector operations"""
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/pd_coach")
    client = MongoClient(mongo_uri)
    return client.get_database()