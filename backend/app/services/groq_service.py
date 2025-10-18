import os
import json
import logging
from typing import List, Dict, Any, Optional
from groq import Groq
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.models import EducatorProfile, PDResource, ActionStep

logger = logging.getLogger(__name__)

class GroqService:
    """Service for interacting with Groq LLM API"""
    
    def __init__(self, api_key: str, model: str = "llama-3.3-70b-versatile"):
        self.client = Groq(api_key=api_key)
        self.model = model
        self.executor = ThreadPoolExecutor(max_workers=2)
        
    async def generate_coaching_response(
        self, 
        educator_profile: EducatorProfile, 
        recommended_resources: List[PDResource]
    ) -> Dict[str, Any]:
        """Generate personalized coaching message and action steps"""
        try:
            # Prepare the prompt
            prompt = self._create_coaching_prompt(educator_profile, recommended_resources)
            
            # Generate response using Groq
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                self.executor,
                self._call_groq_api,
                prompt
            )
            
            # Parse the response
            parsed_response = self._parse_coaching_response(response)
            
            logger.info(f"Generated coaching response for {educator_profile.name}")
            return parsed_response
            
        except Exception as e:
            logger.error(f"Error generating coaching response: {e}")
            # Return fallback response
            return self._create_fallback_response(educator_profile, recommended_resources)
    
    def _call_groq_api(self, prompt: str) -> str:
        """Make synchronous call to Groq API"""
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert professional development coach for educators. You provide personalized, actionable advice based on teacher profiles and available resources. Always respond in JSON format with 'coach_message' and 'action_steps' fields."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=1000,
            )
            
            return chat_completion.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            raise
    
    def _create_coaching_prompt(
        self, 
        educator_profile: EducatorProfile, 
        recommended_resources: List[PDResource]
    ) -> str:
        """Create a detailed prompt for the coaching response"""
        
        # Format educator profile
        profile_text = f"""
        Educator Profile:
        - Name: {educator_profile.name}
        - Grade Levels: {', '.join(educator_profile.grade_levels)}
        - Subjects: {', '.join(educator_profile.subjects)}
        - Teaching Goals: {', '.join(educator_profile.teaching_goals)}
        - Available Time: {educator_profile.available_time_per_week} minutes per week
        - Budget Constraint: {educator_profile.budget_constraint or 'Not specified'}
        - Experience Level: {educator_profile.experience_level}
        """
        
        # Format recommended resources
        resources_text = "Recommended Resources:\\n"
        for i, resource in enumerate(recommended_resources[:5], 1):
            resources_text += f"""
        {i}. {resource.title} ({resource.resource_type})
           - Description: {resource.description[:100]}...
           - Duration: {resource.duration_minutes or 'Not specified'} minutes
           - Level: {resource.level}
           - Format: {resource.format}
           - Cost: {resource.cost}
        """
        
        prompt = f"""
        Based on the following educator profile and recommended resources, provide personalized professional development coaching advice.

        {profile_text}

        {resources_text}

        Please provide your response in the following JSON format:
        {{
            "coach_message": "A personalized 2-4 sentence coaching message that addresses the educator's specific goals and constraints, referencing the recommended resources",
            "action_steps": [
                {{
                    "step": "Specific actionable step 1",
                    "priority": "high|medium|low",
                    "estimated_time": 30
                }},
                {{
                    "step": "Specific actionable step 2", 
                    "priority": "high|medium|low",
                    "estimated_time": 15
                }},
                {{
                    "step": "Specific actionable step 3",
                    "priority": "high|medium|low", 
                    "estimated_time": 45
                }}
            ]
        }}

        Guidelines:
        - Make the coaching message warm, encouraging, and specific to their goals
        - Ensure action steps are concrete and achievable within their time constraints
        - Reference specific resources when relevant
        - Consider their experience level and budget constraints
        - Keep action steps realistic for their available time per week
        """
        
        return prompt
    
    def _parse_coaching_response(self, response: str) -> Dict[str, Any]:
        """Parse the JSON response from Groq"""
        try:
            # Try to extract JSON from the response
            response = response.strip()
            
            # Find JSON content (sometimes wrapped in markdown)
            if "```json" in response:
                start = response.find("```json") + 7
                end = response.find("```", start)
                response = response[start:end].strip()
            elif "```" in response:
                start = response.find("```") + 3
                end = response.find("```", start)
                response = response[start:end].strip()
            
            # Parse JSON
            parsed = json.loads(response)
            
            # Validate structure
            if "coach_message" not in parsed or "action_steps" not in parsed:
                raise ValueError("Missing required fields in response")
            
            # Convert action steps to ActionStep objects
            action_steps = []
            for step_data in parsed["action_steps"]:
                if isinstance(step_data, dict):
                    action_step = ActionStep(
                        step=step_data.get("step", ""),
                        priority=step_data.get("priority", "medium"),
                        estimated_time=step_data.get("estimated_time")
                    )
                    action_steps.append(action_step)
                else:
                    # Handle simple string format
                    action_step = ActionStep(step=str(step_data))
                    action_steps.append(action_step)
            
            return {
                "coach_message": parsed["coach_message"],
                "action_steps": action_steps
            }
            
        except Exception as e:
            logger.error(f"Error parsing coaching response: {e}")
            logger.debug(f"Raw response: {response}")
            raise ValueError(f"Failed to parse coaching response: {e}")
    
    def _create_fallback_response(
        self, 
        educator_profile: EducatorProfile, 
        recommended_resources: List[PDResource]
    ) -> Dict[str, Any]:
        """Create a fallback response when AI generation fails"""
        
        # Create a basic coaching message
        goals_text = ", ".join(educator_profile.teaching_goals[:2])
        coach_message = f"Based on your goals to {goals_text}, I've found some great resources to help you get started. Consider beginning with the recommended workshops and tools that align with your {educator_profile.available_time_per_week}-minute weekly schedule."
        
        # Create basic action steps
        action_steps = [
            ActionStep(
                step="Review the recommended resources and select 1-2 that align with your immediate goals",
                priority="high",
                estimated_time=15
            ),
            ActionStep(
                step="Schedule time in your calendar for professional development activities",
                priority="medium", 
                estimated_time=10
            ),
            ActionStep(
                step="Connect with a colleague to discuss your professional development plans",
                priority="low",
                estimated_time=20
            )
        ]
        
        return {
            "coach_message": coach_message,
            "action_steps": action_steps
        }