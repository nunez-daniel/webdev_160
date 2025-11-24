-- MySQL dump 10.13  Distrib 8.0.41, for macos15 (x86_64)
--
-- Host: localhost    Database: ofs_db
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `order_item`
--

DROP TABLE IF EXISTS `order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `quantity` bigint DEFAULT NULL,
  `unit_price` decimal(38,2) DEFAULT NULL,
  `weight` decimal(38,2) DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKgv4bnmo7cbib2nh0b2rw9yvir` (`order_id`),
  CONSTRAINT `FKgv4bnmo7cbib2nh0b2rw9yvir` FOREIGN KEY (`order_id`) REFERENCES `customer_order` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_item`
--

LOCK TABLES `order_item` WRITE;
/*!40000 ALTER TABLE `order_item` DISABLE KEYS */;
INSERT INTO `order_item` VALUES (1,'https://media.istockphoto.com/id/152971676/photo/glass-of-orange-juice-and-fresh-oranges.jpg?s=612x612&w=0&k=20&c=PLfvkn63OMHN8epb8F9Yfx48BsBOxWzfwL2BSWdV1Nw=',13,'Orange Juice',6,3.99,1.50,1),(2,'https://media.istockphoto.com/id/173242750/photo/banana-bunch.jpg?s=612x612&w=0&k=20&c=MAc8AXVz5KxwWeEmh75WwH6j_HouRczBFAhulLAtRUU=',14,'Banana',8,2.99,1.25,1),(3,'https://media.istockphoto.com/id/543564492/photo/coconut-with-half-and-leaves-on-white-background.jpg?s=612x612&w=0&k=20&c=5DOZf3Lu0ovT3iPSJ_sa4omWq4HfzANznfOYKAuswA8=',15,'Coconut',1,4.99,1.10,1),(4,'https://cdn-icons-png.freepik.com/512/17465/17465389.png',65,'Over 20 Lbs Robot Fee',1,10.00,0.00,1),(5,'https://media.istockphoto.com/id/173242750/photo/banana-bunch.jpg?s=612x612&w=0&k=20&c=MAc8AXVz5KxwWeEmh75WwH6j_HouRczBFAhulLAtRUU=',14,'Banana',1,2.99,1.25,2),(6,'https://media.istockphoto.com/id/152971676/photo/glass-of-orange-juice-and-fresh-oranges.jpg?s=612x612&w=0&k=20&c=PLfvkn63OMHN8epb8F9Yfx48BsBOxWzfwL2BSWdV1Nw=',13,'Orange Juice',1,3.99,1.50,2),(7,'https://mojo.generalmills.com/api/public/content/uK7YQwWbBEakjH1Dq59YVQ_gmi_hi_res_jpeg.jpeg?v=c4624996&t=1cfcc0a09ea348e0b53b953eb7705409',10,'Lucky Charms',1,2.99,1.50,2),(8,'https://media.istockphoto.com/id/1130546856/photo/himalayan-salt-in-wooden-spoon-isolated-on-white.jpg?s=612x612&w=0&k=20&c=T2ZuDmkCxcq2YMlkRRI5YgZzBHJ6FYI89u0XpMDWbAY=',23,'Pink Sea Salt',1,8.99,1.10,2),(9,'https://media.istockphoto.com/id/508912045/photo/fragrant-cinnamon-sticks.jpg?s=612x612&w=0&k=20&c=7Ipb98k0SSzYS0eZbKHLSFpKmmD016j_kSxu2ZgR2YE=',22,'Cinnamon',1,2.99,1.10,2),(10,'https://mojo.generalmills.com/api/public/content/uK7YQwWbBEakjH1Dq59YVQ_gmi_hi_res_jpeg.jpeg?v=c4624996&t=1cfcc0a09ea348e0b53b953eb7705409',10,'Lucky Charms',1,2.99,1.50,3),(11,'https://media.istockphoto.com/id/173242750/photo/banana-bunch.jpg?s=612x612&w=0&k=20&c=MAc8AXVz5KxwWeEmh75WwH6j_HouRczBFAhulLAtRUU=',14,'Banana',1,2.99,1.25,3),(12,'https://media.istockphoto.com/id/543564492/photo/coconut-with-half-and-leaves-on-white-background.jpg?s=612x612&w=0&k=20&c=5DOZf3Lu0ovT3iPSJ_sa4omWq4HfzANznfOYKAuswA8=',15,'Coconut',1,4.99,1.10,3),(13,'https://media.istockphoto.com/id/152971676/photo/glass-of-orange-juice-and-fresh-oranges.jpg?s=612x612&w=0&k=20&c=PLfvkn63OMHN8epb8F9Yfx48BsBOxWzfwL2BSWdV1Nw=',13,'Orange Juice',1,3.99,1.50,4),(14,'https://media.istockphoto.com/id/173242750/photo/banana-bunch.jpg?s=612x612&w=0&k=20&c=MAc8AXVz5KxwWeEmh75WwH6j_HouRczBFAhulLAtRUU=',14,'Banana',1,2.99,1.25,4),(15,'https://media.istockphoto.com/id/543564492/photo/coconut-with-half-and-leaves-on-white-background.jpg?s=612x612&w=0&k=20&c=5DOZf3Lu0ovT3iPSJ_sa4omWq4HfzANznfOYKAuswA8=',15,'Coconut',1,4.99,1.10,4),(16,'https://media.istockphoto.com/id/173242750/photo/banana-bunch.jpg?s=612x612&w=0&k=20&c=MAc8AXVz5KxwWeEmh75WwH6j_HouRczBFAhulLAtRUU=',14,'Banana',1,2.99,1.25,5),(17,'https://media.istockphoto.com/id/152971676/photo/glass-of-orange-juice-and-fresh-oranges.jpg?s=612x612&w=0&k=20&c=PLfvkn63OMHN8epb8F9Yfx48BsBOxWzfwL2BSWdV1Nw=',13,'Orange Juice',1,3.99,1.50,5),(18,'https://media.istockphoto.com/id/1130546856/photo/himalayan-salt-in-wooden-spoon-isolated-on-white.jpg?s=612x612&w=0&k=20&c=T2ZuDmkCxcq2YMlkRRI5YgZzBHJ6FYI89u0XpMDWbAY=',23,'Pink Sea Salt',3,8.99,1.10,5),(19,'https://media.istockphoto.com/id/1147423048/photo/chilli-flakes-scattered-over-white-background-top-view.jpg?s=612x612&w=0&k=20&c=xSVirCFOWJqd7kn6LgTTOqa69ykZz208UTycuHwnYYo=',24,'Pepper Flakes',20,3.99,1.10,5),(20,'https://cdn-icons-png.freepik.com/512/17465/17465389.png',65,'Over 20 Lbs Robot Fee',1,10.00,0.00,5),(21,'https://media.istockphoto.com/id/1340750570/photo/open-mesh-bag-with-fresh-hass-avocados-isolated-on-white.jpg?s=612x612&w=0&k=20&c=wvICn8OHHY1Le-btRWIbf67M-eVZxs7Lu9ef_modq7Q=',18,'Avocado',50,1.99,1.10,6),(22,'https://media.istockphoto.com/id/185284489/photo/orange.jpg?s=612x612&w=0&k=20&c=m4EXknC74i2aYWCbjxbzZ6EtRaJkdSJNtekh4m1PspE=',19,'Orange',50,2.99,1.10,6),(23,'https://media.istockphoto.com/id/1130546856/photo/himalayan-salt-in-wooden-spoon-isolated-on-white.jpg?s=612x612&w=0&k=20&c=T2ZuDmkCxcq2YMlkRRI5YgZzBHJ6FYI89u0XpMDWbAY=',23,'Pink Sea Salt',35,8.99,1.10,6),(24,'https://media.istockphoto.com/id/1147423048/photo/chilli-flakes-scattered-over-white-background-top-view.jpg?s=612x612&w=0&k=20&c=xSVirCFOWJqd7kn6LgTTOqa69ykZz208UTycuHwnYYo=',24,'Pepper Flakes',30,3.99,1.10,6),(25,'https://media.istockphoto.com/id/1450576005/photo/tomato-isolated-tomato-on-white-background-perfect-retouched-tomatoe-side-view-with-clipping.jpg?s=612x612&w=0&k=20&c=lkQa_rpaKpc-ELRRGobYVJH-eMJ0ew9BckCqavkSTA0=',21,'Tomato',16,3.99,1.10,6),(26,'https://cdn-icons-png.freepik.com/512/17465/17465389.png',65,'Over 20 Lbs Robot Fee',1,10.00,0.00,6),(27,'https://media.istockphoto.com/id/508912045/photo/fragrant-cinnamon-sticks.jpg?s=612x612&w=0&k=20&c=7Ipb98k0SSzYS0eZbKHLSFpKmmD016j_kSxu2ZgR2YE=',22,'Cinnamon',9,2.99,1.10,7),(28,'https://media.istockphoto.com/id/1301622377/photo/ground-black-pepper-in-a-wooden-bowl-and-peppercorns-on-a-white-background-isolated-top-view.jpg?s=612x612&w=0&k=20&c=xPqOOYHRslVzSSlFAyLc9evjCFgLW2oHxgvmw8uR1Nc=',25,'Ground Pepper',5,2.99,1.10,7),(29,'https://media.istockphoto.com/id/543564492/photo/coconut-with-half-and-leaves-on-white-background.jpg?s=612x612&w=0&k=20&c=5DOZf3Lu0ovT3iPSJ_sa4omWq4HfzANznfOYKAuswA8=',15,'Coconut',16,4.99,1.10,8),(30,'https://media.istockphoto.com/id/1273714189/photo/heap-of-hibiscus-tea-on-white-background-isolated-the-view-from-top.jpg?s=612x612&w=0&k=20&c=eZdVA0ycSEHh2vVWnWQK9_y87mztuPcyT3sZMi1uJOU=',16,'Hibiscus',1,2.99,2.50,8),(31,'https://cdn-icons-png.freepik.com/512/17465/17465389.png',65,'Over 20 Lbs Robot Fee',1,10.00,0.00,8),(32,'https://media.istockphoto.com/id/173242750/photo/banana-bunch.jpg?s=612x612&w=0&k=20&c=MAc8AXVz5KxwWeEmh75WwH6j_HouRczBFAhulLAtRUU=',14,'Banana',1,2.99,1.25,9),(33,'https://media.istockphoto.com/id/543564492/photo/coconut-with-half-and-leaves-on-white-background.jpg?s=612x612&w=0&k=20&c=5DOZf3Lu0ovT3iPSJ_sa4omWq4HfzANznfOYKAuswA8=',15,'Coconut',15,4.99,1.10,9),(34,'https://media.istockphoto.com/id/1273714189/photo/heap-of-hibiscus-tea-on-white-background-isolated-the-view-from-top.jpg?s=612x612&w=0&k=20&c=eZdVA0ycSEHh2vVWnWQK9_y87mztuPcyT3sZMi1uJOU=',16,'Hibiscus',1,2.99,2.50,9),(35,'https://cdn-icons-png.freepik.com/512/17465/17465389.png',65,'Over 20 Lbs Robot Fee',1,10.00,0.00,9);
/*!40000 ALTER TABLE `order_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-23 21:05:20
