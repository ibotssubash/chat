-- PostgreSQL Database Setup for Real-Time Chat Application
-- Run this script to create the database and tables with proper CASCADE relationships

-- Create database (run as postgres user)
-- CREATE DATABASE chatdb;
-- CREATE USER chatuser WITH PASSWORD 'yourpassword';
-- GRANT ALL PRIVILEGES ON DATABASE chatdb TO chatuser;

-- Connect to chatdb database and run the following:

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Conversation Participants table with CASCADE deletes
CREATE TABLE conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id) -- Prevent duplicate participants
);

-- Create Messages table with CASCADE deletes
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Test CASCADE behavior with sample data

-- Insert test users
INSERT INTO users (username, email, password_hash) VALUES 
('alice', 'alice@example.com', 'hashed_password_1'),
('bob', 'bob@example.com', 'hashed_password_2'),
('charlie', 'charlie@example.com', 'hashed_password_3');

-- Insert test conversation
INSERT INTO conversations (id) VALUES (1);  -- Force ID 1 for testing

-- Add participants to conversation
INSERT INTO conversation_participants (conversation_id, user_id) VALUES 
(1, 1),  -- Alice in conversation 1
(1, 2);  -- Bob in conversation 1

-- Insert test messages
INSERT INTO messages (conversation_id, sender_id, content) VALUES 
(1, 1, 'Hello from Alice!'),
(1, 2, 'Hi Alice, this is Bob!'),
(1, 1, 'How are you doing?');

-- CASCADE TEST QUERIES (run these to test cascade behavior):

-- TEST CASE 1: Delete conversation
-- This should automatically delete:
-- - All messages in conversation 1
-- - All participants in conversation 1

-- Before deletion:
-- SELECT COUNT(*) as messages_count FROM messages WHERE conversation_id = 1;
-- SELECT COUNT(*) as participants_count FROM conversation_participants WHERE conversation_id = 1;

-- Delete conversation:
-- DELETE FROM conversations WHERE id = 1;

-- After deletion (should return 0):
-- SELECT COUNT(*) as messages_count FROM messages WHERE conversation_id = 1;
-- SELECT COUNT(*) as participants_count FROM conversation_participants WHERE conversation_id = 1;

-- TEST CASE 2: Delete user
-- First recreate some test data:
-- INSERT INTO conversations (id) VALUES (2);
-- INSERT INTO conversation_participants (conversation_id, user_id) VALUES (2, 3), (2, 1);
-- INSERT INTO messages (conversation_id, sender_id, content) VALUES (2, 3, 'Hello from Charlie!');

-- Before deletion:
-- SELECT COUNT(*) as charlie_messages FROM messages WHERE sender_id = 3;
-- SELECT COUNT(*) as charlie_participants FROM conversation_participants WHERE user_id = 3;

-- Delete user Charlie (id = 3):
-- DELETE FROM users WHERE id = 3;

-- After deletion (should return 0):
-- SELECT COUNT(*) as charlie_messages FROM messages WHERE sender_id = 3;
-- SELECT COUNT(*) as charlie_participants FROM conversation_participants WHERE user_id = 3;

-- The CASCADE behavior ensures data integrity when users or conversations are deleted.
