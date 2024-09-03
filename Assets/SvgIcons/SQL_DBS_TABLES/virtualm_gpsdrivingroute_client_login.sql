-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: virtualm_gpsdrivingroute
-- ------------------------------------------------------
-- Server version	8.0.32

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
-- Table structure for table `client_login`
--

DROP TABLE IF EXISTS `client_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_login` (
  `client_id` varchar(255) NOT NULL,
  `office_id` varchar(45) NOT NULL,
  `plan_id` varchar(255) DEFAULT NULL,
  `role_id` varchar(45) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `verify_otp` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) NOT NULL,
  `updated_at` varchar(255) DEFAULT NULL,
  `isregisterVerified` int DEFAULT '0' COMMENT '0 - No\n1 - Yes',
  `forgetPassOTP` varchar(45) DEFAULT NULL,
  `role_type` int DEFAULT NULL COMMENT '0-Default\n1-Admin\n2-Employee',
  PRIMARY KEY (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_login`
--

LOCK TABLES `client_login` WRITE;
/*!40000 ALTER TABLE `client_login` DISABLE KEYS */;
INSERT INTO `client_login` VALUES ('VO_1d54989c8','e88acca1-2166-4b28-bdcb-5544e1b561f7','','b867c562-0f4d-4ad0-915a-9f72776c3135','client3','client3@gmail.com','$2b$10$quU4lDJOsZaWkfP8YxzxQOYUwefNVHVUehFNczNk8I8xn4oIcEfxi','664159','1694166308421',NULL,0,NULL,2),('VO_575e100b3','e88acca1-2166-4b28-bdcb-5544e1b561f7','1f459d66-7db0-49bf-8af0-55b4d7f8c133','','client1','client1@gmail.com','$2b$10$/oU4lZpgTQzb2romYhiIfO14BK2XIQ6wbTM0ByWs7QV9qFQU73vmq','677182','1694166196496',NULL,0,NULL,1);
/*!40000 ALTER TABLE `client_login` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-08 15:26:07
