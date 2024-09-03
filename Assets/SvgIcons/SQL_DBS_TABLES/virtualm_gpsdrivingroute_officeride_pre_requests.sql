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
-- Table structure for table `officeride_pre_requests`
--

DROP TABLE IF EXISTS `officeride_pre_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `officeride_pre_requests` (
  `id` varchar(255) NOT NULL,
  `working_days` varchar(255) NOT NULL,
  `time_slot` varchar(255) NOT NULL,
  `vendor_selection` int NOT NULL DEFAULT '0' COMMENT '0-Optimizer\\n1-Custom Vendors',
  `trip_type` bigint NOT NULL,
  `vehicle_type` bigint NOT NULL,
  `office_location` point NOT NULL,
  `client_code` varchar(255) NOT NULL,
  `site_code` varchar(255) NOT NULL,
  `status` bigint NOT NULL DEFAULT '0' COMMENT '0-Default\\n1-Active\\n2-Expired\\n3-Cancelled\\n4-Hold',
  `trip_duration_start` timestamp NULL DEFAULT NULL,
  `trip_duration_end` timestamp NULL DEFAULT NULL,
  `employees_count` bigint NOT NULL,
  `employees_ids` varchar(255) NOT NULL,
  `vendors_ids` varchar(255) DEFAULT NULL,
  `vendors_count` bigint DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `officeride_pre_requests`
--

LOCK TABLES `officeride_pre_requests` WRITE;
/*!40000 ALTER TABLE `officeride_pre_requests` DISABLE KEYS */;
INSERT INTO `officeride_pre_requests` VALUES ('2dbcabf6-c46c-4cfc-baa0-7bdaf23f443d','2,3,4,5,6','10:00AM-7:00PM',0,1,0,_binary '\0\0\0\0\0\0\0fffff\Ф*@\м\л\л\лл°Q@','4','4',0,'2023-09-21 10:24:57','2023-09-21 10:41:37',5,'2,2,2,2,2','1,1,1,1,1',5,'2023-09-22 05:06:03',NULL),('70dbf367-bffe-44c5-b16c-03aa0b8cae87','2,3','10:00AM-7:00PM',0,1,0,_binary '\0\0\0\0\0\0\0fffff\Ф*@\м\л\л\лл°Q@','4','4',0,'2026-11-21 20:11:37','2026-11-21 20:11:37',5,'2,2,2,2,2','1,1,1,1,1',5,'2023-09-22 05:06:22','2023-09-22 05:17:11');
/*!40000 ALTER TABLE `officeride_pre_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-22 11:13:03
