# Todo Lists App Tasks

- [x] Create a TODO Lists App with the following features:
  - [x] User can Login, Logout and Register using Firebase Authentication and Save User Data in Firestore
  - [x] CRUD of TODO lists
  - [x] Simple UI/UX design
  - [x] Make sure we are using the Firebase Firestore docs https://firebase.google.com/docs/firestore?hl=en&authuser=0

# Fixes

# Improvements

- [ ]

# Objectives

- [ ] Secure (users can only see their own TODO lists)
- [ ] Efficient lookups (use indexes) to speed up queries
- [ ] View newest TODO lists first

# Knowledge Lists

## How Index Works in Firebase in simple terms

Think of Firebase indexes like a book's index page! Just as a book's index helps you quickly find specific topics without reading the whole book, Firebase indexes help your app quickly find specific data without searching through everything.

Let's break it down:

- Without an index: Like trying to find a specific word by reading a whole book
- With an index: Like using a book's index page to jump straight to what you need

## Use Case

In our Todo Lists app, we need to:

1. Find tasks for a specific user (like finding all chapters written by one author)
2. Show newest tasks first (like sorting chapters by date)

Here's how it works in our app:

```javascript
// This query needs an index because it does two things at once:
query(
  collection(db, "todos"),
  where("userId", "==", userId), // First: Find your tasks
  orderBy("timestamp", "desc") // Then: Sort by newest first
);
```

## When to use Indexes

We use indexes in our Todo Lists app because:

1. 📱 User Experience Needs:

   - Quick loading of tasks (nobody likes waiting!)
   - Show newest tasks first (like social media feeds)
   - Real-time updates (instant task changes)

2. 🔍 Search Pattern Needs:

   - Finding specific user's tasks AND sorting them
   - Just like Instagram showing YOUR posts in time order

3. 📊 Data Size Considerations:
   - Many users with many tasks
   - Like a big library needing a catalog system

### Analogy

🏫 Think of a School Library:

1. Without Index (Bad):

   - Librarian checks EVERY book to find what you need
   - Takes forever as library grows bigger
   - Like searching todos without an index!

2. With Index (Good):
   - Library has a card catalog system
   - Can find books by author AND publication date
   - Just like our todos by userId AND timestamp!

💡 MySQL Connection:

- Just like MySQL's CREATE INDEX
- Both help speed up searches
- Both are crucial for larger datasets

## When to not use Indexes

Let's understand when indexes aren't needed, using real examples:

1. 🎮 Candy Crush Game Example:

```javascript
// Simple score save - No index needed!
await addDoc(collection(db, "scores"), {
  userId: currentUser.uid,
  level: 5,
  score: 1000,
});

// Simple score fetch - No index needed!
const scoreDoc = await getDoc(doc(db, "scores", scoreId));
```

2. 🎯 Simple App Scenarios:

   - Single document lookups (getting one score)
   - Small data collections (few items)
   - No complex sorting needed

3. 📱 Real Examples where Indexes aren't needed:
   - User profiles (direct document access)
   - Game settings (simple gets and updates)
   - Daily challenges (single document per day)

Remember: Start simple! Add indexes only when you need to search AND sort at the same time, just like our Todo Lists app! 🚀
