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
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) NOT NULL,
  `updated_at` varchar(255) DEFAULT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `office_id` varchar(45) NOT NULL,
  `role_category` int DEFAULT NULL COMMENT '0 - Admin\\\\n1 - Client\\\\n2 - Vendor\\\\n3 - Operator',
  `type` int DEFAULT '0' COMMENT '0 - Default\n1- Customized',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('09b7e536-05e4-48de-ae04-f4ac91428e4e','Manager','','1694166709985',NULL,'VO_1789d59c0',NULL,'e88acca1-2166-4b28-bdcb-5544e1b561f7',1,1),('2ca24927-73ab-4bae-bfc0-0af142ad3e7b','Vendor','To Vendor all employess and activities','1694001430430',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',2,0),('85e6227a-39ce-4187-82bf-d67d423839d7','Operator','To Vendor all employess and activities','1694074218118',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',3,0),('a54fdbb1-78b4-4364-aaea-e6da130bd5d3','Client','To Client all employess and activities','1694001458551',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',1,0),('b867c562-0f4d-4ad0-915a-9f72776c3135','Manager','','1694166308401',NULL,'VO_1d54989c8',NULL,'e88acca1-2166-4b28-bdcb-5544e1b561f7',1,1),('c90514ae-ffc2-46b9-b7c1-7aea71ed2fe8','Manager','','1694166897738',NULL,'VO_b17c85f82',NULL,'e6fd463d-97d7-49b0-9ffc-25751c9f8140',1,1),('e976ed68-54b3-4644-b2bb-e1380decba98','Operator','To Vendor all employess and activities','1694071866518',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',3,0);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-08 15:26:08
