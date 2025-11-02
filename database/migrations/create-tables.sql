-- DevNexes Solutions Database Tables
-- Run this in MySQL Workbench or phpMyAdmin

-- Create Database
CREATE DATABASE IF NOT EXISTS devnex_solutions;
USE devnex_solutions;

-- 1. Contacts Table (Contact Form Submissions)
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Project Requests Table (Start Project Form)
CREATE TABLE IF NOT EXISTS project_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20),
    company VARCHAR(255),
    project_type VARCHAR(100) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT NOT NULL,
    budget VARCHAR(50),
    timeline VARCHAR(50),
    additional_info TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Projects Table (Admin Panel Projects)
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    image TEXT,
    files TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Reviews Table (Comments/Chat Messages)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    rating INT DEFAULT 5,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Insert Default Projects
INSERT INTO projects (title, description, status) VALUES 
('E-Commerce Website', 'Modern online store with payment integration', 'latest'),
('AI Chatbot System', 'Intelligent customer support automation', 'progress'),
('Mobile App Development', 'Cross-platform mobile application', 'upcoming');

-- Insert Sample Data
INSERT INTO reviews (name, email, rating, review_text) VALUES 
('John Doe', 'john@example.com', 5, 'Excellent work! Very professional and delivered on time.'),
('Sarah Khan', 'sarah@example.com', 5, 'Amazing developer! Highly recommend DevNexes Solutions.');

-- Show Tables
SHOW TABLES;

-- Show Table Structure
DESCRIBE contacts;
DESCRIBE project_requests;
DESCRIBE projects;
DESCRIBE reviews;