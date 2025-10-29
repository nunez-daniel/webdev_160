-- Grant root user access from any host
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'Password123';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Create application database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ofs_db;