# How to Enable Vector Search (RAG)

Your application handles thousands of notes efficiently using MongoDB Atlas Vector Search.

## Step 1: Login to MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Select your Cluster (`Cluster0`).

## Step 2: Create Search Index
1. Click on the **"Atlas Search"** tab (or "Search" tab).
2. Click **"Create Search Index"**.
3. Select **"JSON Editor"**.
4. Select Database: `notes_db` (or whatever your DB name is, check `.env` connection string).
5. Select Collection: `notes`.
6. Name the index: `default` (This is important! The code assumes the index is named "default").
7. Paste the content of `atlas_vector_index.json` (created in this folder) into the editor.
   ```json
   {
     "fields": [
       {
         "numDimensions": 768,
         "path": "vectorEmbedding",
         "similarity": "cosine",
         "type": "vector"
       }
     ]
   }
   ```
8. Click **"Next"** and **"Create Search Index"**.

## Step 3: Wait
It takes about 1 minute for the index to build. Once Active, your Chat assistant will be super smart!
