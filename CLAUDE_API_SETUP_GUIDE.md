# Claude API Integration Guide

## Quick Setup (5 minutes)

### Prerequisites
- Claude API key from Anthropic (starts with `sk-ant-`)
- Active Anthropic account with API credits
- Kids Learning app running locally

---

## Step 1: Get Your Claude API Key

### Option A: Create New API Key
1. Go to **https://console.anthropic.com/account/keys**
2. Sign in with your Anthropic account
3. Click **"Create Key"** button
4. A new key starting with `sk-ant-` will appear
5. **Copy the entire key** (it won't show again!)
6. Click elsewhere to hide it

### Option B: Use Existing Key
1. Go to **https://console.anthropic.com/account/keys**
2. Find your existing key in the list
3. Click the copy icon next to it

### Important Notes:
- Keys start with `sk-ant-` followed by random characters
- Keep your key **SECRET** — don't share it
- The key has API quotas based on your account plan
- Free trial accounts start with $5 credit

---

## Step 2: Add Key to Kids Learning App

### In the App:

1. **Open Settings Screen**
   - Tap the **⚙️ Settings** button (top right of home)
   - Or tap Settings in bottom navigation bar

2. **Find "Claude AI" Section**
   - Scroll down to "Claude AI — Better Conversations"
   - You'll see a description and input field

3. **Paste Your API Key**
   - Click the input field
   - Paste your `sk-ant-...` key
   - **Don't** add any extra spaces or text

4. **Save the Key**
   - Click **"Save Key"** button
   - You should see: ✨ **"Claude AI key saved!"**

5. **Test Connection (Optional)**
   - Click the **"Test"** button
   - Wait a moment...
   - Should see: 🎉 **"Claude AI connected!"**

6. **Verify It's Active**
   - Look at the top right of home screen
   - Badge should now show: **✅ Claude AI Active** (instead of ⚡ Smart)

---

## Step 3: Start Using Claude AI

### Start a Conversation:
1. Click the **💬 Chat** button
2. Select a conversation mode (Daily Chat, Story Builder, etc.)
3. Have a conversation with your child
4. Claude AI now powers all responses!

### What You'll Notice:
- ✅ More natural, contextual questions
- ✅ Follow-ups build on what they said (no topic jumping)
- ✅ Feedback references specific things they said
- ✅ Grammar errors corrected gently and naturally
- ✅ Different reactions based on response quality
- ✅ Longer conversations on the same topic (3-6 turns)

---

## Troubleshooting

### ❌ Error: "Invalid key — should start with sk-ant-"
**Solution:**
- Copy the key again from console.anthropic.com
- Make sure you got the entire key
- Check for spaces or extra characters
- Paste it exactly as copied

### ❌ Error: "Failed to connect" when testing
**Possible causes:**
1. **No internet connection** - Check your network
2. **API quota exhausted** - Check Anthropic console for remaining credits
3. **Invalid key** - Verify key format again
4. **API service down** - Try again in a few minutes

**Solution steps:**
- Verify internet connection
- Check remaining API credits at https://console.anthropic.com/account/overview
- Remove the key and try adding it again
- Clear browser cache (Ctrl+Shift+Delete) and reload

### ❌ Error: "403 Unauthorized"
**Reason:** API key is invalid or doesn't have access
**Solution:**
- Go to console.anthropic.com
- Check if the key is still active/not revoked
- Try creating a new key
- Add new key to the app

### ⚡ App Still Shows "Smart Mode"
**Reason:** API key was never saved or was removed
**Solution:**
- Check settings again
- Verify API key was pasted correctly
- Click "Save Key" again
- Refresh the browser (F5)

### 🔄 Claude Responses Are Slow
**Normal behavior** - Claude thinks more carefully
- First response might take 2-3 seconds
- This is expected (more thoughtful = better conversations)
- Local fallback activates if Claude takes too long

**If consistently slow:**
- Check internet connection speed
- Verify API is responding: https://console.anthropic.com/status
- Try a test connection again

---

## API Usage & Costs

### Pricing (as of 2024)
- Claude 3.5 Sonnet (what the app uses):
  - Input: $3 per million tokens
  - Output: $15 per million tokens
- Typical conversation: ~500-1000 tokens per exchange
- Rough estimate: **$0.01-0.02 per conversation turn**

### Examples:
- 100 conversations of 10 turns each = ~$1-2
- 1000 conversations of 5 turns each = ~$2.50-5

### Monitor Your Usage:
1. Go to **https://console.anthropic.com/account/overview**
2. Check "Usage" section
3. See tokens used this month
4. View remaining credits

### To Save on Costs:
- Use local Smart Mode for simple interactions
- Only use Claude AI for complex conversations
- Batch conversations during specific times
- Monitor usage regularly

---

## Advanced: API Key Management

### Change Your API Key
1. Go to Settings
2. Paste the NEW API key
3. Click "Save Key"
4. Old key is automatically replaced

### Remove API Key
1. Go to Settings
2. Click "Remove" button
3. App reverts to local Smart Mode
4. Key is deleted from app storage

### Security Notes:
- Keys are stored in browser's localStorage
- If you're on a shared computer, remove the key before leaving
- Never commit the key to version control
- If key is compromised, delete it from Anthropic console

---

## What Claude AI Does

### Conversation Generation
- Reads full conversation context (last 7 exchanges)
- Generates contextually appropriate responses
- Stays on current topic for 3-6 turns
- Naturally transitions between topics

### Response Quality:
- Analyzes child's grammar, vocabulary, fluency
- Generates contextual praise (not generic)
- Gently corrects errors by modeling
- Adapts difficulty to child's level

### Session Analysis:
- Tracks vocabulary learned
- Monitors grammar improvement
- Measures fluency over time
- Provides detailed session reports

---

## System Prompt Details

Claude receives a detailed system prompt that includes:

1. **Child Profile**: Name, age, class, interests, current level
2. **Conversation Context**: Current topic, entities mentioned, turns on topic
3. **Conversational Rules**: Stay on topic, ask about specific things, adapt to level
4. **Tone Guidelines**: Warm, Indian English, natural phrasing
5. **Error Correction**: Gentle, via modeling, appropriate to level
6. **Response Format**: Specific JSON structure for consistency

The system prompt adapts based on:
- Child's English level (1-4)
- Conversation mode (daily chat, story, role-play, etc.)
- Current conversation context
- Child's specific interests

---

## Fallback Behavior

If Claude API is unavailable, the app automatically uses **Smart Mode** (local AI):
- Same improved conversation logic runs locally
- No API calls needed
- Slightly simpler responses (but still good)
- No API costs
- Instant responses

The app seamlessly switches between Claude and local AI based on availability.

---

## FAQ

**Q: Is my API key safe?**
A: Your key is stored only in your browser's localStorage. It's never sent to our servers - it goes directly to Anthropic's API. For shared computers, remove the key when done.

**Q: How much will this cost?**
A: ~$0.01-0.05 per conversation turn with Claude. Monitor at console.anthropic.com/account/overview.

**Q: Can I switch between Claude and local AI?**
A: Yes! Just remove the key in settings. The app will use local Smart Mode. Add it back anytime.

**Q: What happens if my API key expires?**
A: The app will show a connection error. Go to console.anthropic.com to check your account status.

**Q: Do I need Claude for the app to work?**
A: No! Local Smart Mode works great. Claude just makes conversations more natural.

**Q: Can multiple people use the same API key?**
A: Yes, but they'll share the same API quota. Each person's usage counts toward the same limit.

**Q: Is there a way to limit API costs?**
A: Yes - use local Smart Mode for most sessions, Claude only for important ones.

---

## Next Steps

1. ✅ Get your API key from Anthropic
2. ✅ Open the Kids Learning app settings
3. ✅ Paste your key and save
4. ✅ Test the connection
5. ✅ Start a conversation to see Claude in action!

Enjoy better conversations with your child! 🎉
