# Operational checklist

## After sourcing music audio files

1. Drop 12 mp3 files into `data/audio/` matching the `file` names in `data/songs.json`.
2. Create the Firestore vector index for the songs collection:

```bash
gcloud firestore indexes composite create \
  --project=rag-demo-963ae \
  --collection-group=presentation_songs \
  --query-scope=COLLECTION \
  --field-config=vector-config='{"dimension":1536,"flat":{}}',field-path=embedding_mm
```

3. Run ingestion:

```bash
pnpm ingest:music
```

4. Verify in Firestore console that `presentation_songs` has 12 docs each with an `embedding_mm` vector field.
