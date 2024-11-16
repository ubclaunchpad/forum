import re
from typing import Dict
from openai import OpenAI
import uuid
import json
from datetime import datetime
import psycopg2
from psycopg2.extras import Json, register_uuid
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
DATABASE_URL = os.environ.get("DATABASE_URL")

class TextParser():
        
    def __init__(self):
        pass

    def consume(self, text: str) -> Dict:
        return {"text": text}

    def create_metadata(self, text: str) -> Dict:
        return {"length": len(text)}
    
    
            

class DocumentProcessor():
    
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.conn = psycopg2.connect(DATABASE_URL)
        self.cur = self.conn.cursor()
        self.parses = {
            "text": TextParser(),
            # Add more parsers here
        }
