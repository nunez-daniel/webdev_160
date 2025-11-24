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
-- Table structure for table `customer_order`
--

DROP TABLE IF EXISTS `customer_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_date` datetime(6) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `shipping_address_line1` varchar(255) DEFAULT NULL,
  `shipping_address_line2` varchar(255) DEFAULT NULL,
  `shipping_city` varchar(255) DEFAULT NULL,
  `shipping_country` varchar(255) DEFAULT NULL,
  `shipping_name` varchar(255) DEFAULT NULL,
  `shipping_postal_code` varchar(255) DEFAULT NULL,
  `shipping_state` varchar(255) DEFAULT NULL,
  `stripe_session_id` varchar(255) DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `delivery_car_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKf9abd30bhiqvugayxlpq8ryq9` (`customer_id`),
  KEY `FKq1y78wr5ybdy5oaj0956bt2rb` (`delivery_car_id`),
  CONSTRAINT `FKf9abd30bhiqvugayxlpq8ryq9` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  CONSTRAINT `FKq1y78wr5ybdy5oaj0956bt2rb` FOREIGN KEY (`delivery_car_id`) REFERENCES `delivery_car` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_order`
--

LOCK TABLES `customer_order` WRITE;
/*!40000 ALTER TABLE `customer_order` DISABLE KEYS */;
INSERT INTO `customer_order` VALUES (1,'2025-11-21 14:52:15.615049','DELIVERED','Airport Boulevard','Hourly Lot 3','San Jose','US','Danny Nunez','95110','CA','cs_test_b1zdqNWCsWt79ax8bvP94A09diktNANcE053e4DTxTQJBr7QHMsRl9l8SL',62.85,2,1),(2,'2025-11-21 14:53:02.434365','DELIVERED','525 West Santa Clara Street',NULL,'San Jose','US','Danny Nunez','95113','CA','cs_test_b1x4QK9DgqiElpSe45tekr6hkO2Z56ebVrHytX0m65NO5ISV2By8nDHZ2A',21.95,3,1),(3,'2025-11-23 14:07:59.183399','DELIVERED','3277 S White Rd','#701','San Jose','US','Danny Nunez','95122','CA','cs_test_b15gETQSUYuwCYpa1nS8dv5vlQrYjtAgTXvt8yfhjbmDKwZdy2HCWAybxN',10.97,6,1),(4,'2025-11-23 14:08:41.063986','DELIVERED','525 West Santa Clara Street',NULL,'San Jose','US','Danny Nunez','95113','CA','cs_test_b1WLMcVRkk5OpyKH00Gv8vQClT0NsXAH5f49LLG7xfoV4jGljP6fSAx7sG',11.97,6,1),(5,'2025-11-23 14:09:35.949025','DELIVERED','1290 Tully Road','suite 50','San Jose','US','Danny Nunez','95122','CA','cs_test_b1LpR4IQ4wlPvG5D6JSAUudNB9sMqQZxKWeqMjmnezNS20rT859qYxDHxq',123.75,1,1),(6,'2025-11-23 17:32:13.239109','DELIVERED','3062 Story Road',NULL,'San Jose','US','Joe Mon','95127','CA','cs_test_b1Zp56xVpSwS04PzLCSeyUo30d76WocXXj47ChFtDui3LrQYh9FwtgDOHm',757.19,7,2),(7,'2025-11-23 17:33:06.340713','PAID','800 Embedded Way',NULL,'San Jose','US','TesterMan','95138','CA','cs_test_b1xJLUdrHXAg50UZpaZZxRZ8AOvLLvlYyEOjeRnLsHfmRwp62lsz5gn3UF',41.86,7,NULL),(8,'2025-11-23 19:45:06.018422','PAID','3590 Cas Drive',NULL,'San Jose','US','Bobby Brown','95111','CA','cs_test_b1UB71clTlEWP2hY9AalsS3BKKLIwd7B0M8OtKxvaZkr5lh27DGFJJUp8P',92.83,1,NULL),(9,'2025-11-23 19:51:39.870486','PAID','985 Hellyer Avenue',NULL,'San Jose','US','Steve Middle','95111','CA','cs_test_b1QPkXaHmHHeGvw6DvXJN7df6EmLOTlgZGjX05eRvjUlHvxSqEfLph4cYC',90.83,1,NULL);
/*!40000 ALTER TABLE `customer_order` ENABLE KEYS */;
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
