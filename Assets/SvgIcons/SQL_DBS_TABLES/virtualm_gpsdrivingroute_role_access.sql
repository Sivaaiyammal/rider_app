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
-- Table structure for table `role_access`
--

DROP TABLE IF EXISTS `role_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_access` (
  `id` varchar(255) NOT NULL,
  `role_id` varchar(255) NOT NULL,
  `feature_name` varchar(255) NOT NULL,
  `feature_key` varchar(255) NOT NULL,
  `_view` bigint NOT NULL COMMENT '0 - No, 1 - Yes',
  `_create` bigint NOT NULL COMMENT '0 - No, 1 - Yes',
  `_edit` bigint NOT NULL COMMENT '0 - No, 1 - Yes',
  `_delete` bigint NOT NULL COMMENT '0 - No, 1 - Yes',
  `created_at` varchar(255) NOT NULL,
  `updated_at` varchar(255) DEFAULT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `office_id` varchar(45) NOT NULL,
  KEY `role_access_role_id_foreign` (`role_id`),
  CONSTRAINT `role_access_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_access`
--

LOCK TABLES `role_access` WRITE;
/*!40000 ALTER TABLE `role_access` DISABLE KEYS */;
INSERT INTO `role_access` VALUES ('53407442-9c53-4dbd-acb5-c5f00ba982b1','2ca24927-73ab-4bae-bfc0-0af142ad3e7b','Live Tracking','livetracking',1,1,1,0,'1694001430430',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('33bef505-b6bb-45a8-9b1c-9939909bf275','2ca24927-73ab-4bae-bfc0-0af142ad3e7b','Employee','employee',1,1,1,0,'1694001430430',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('56c7d7d6-0399-4542-bd72-fc4c15437003','2ca24927-73ab-4bae-bfc0-0af142ad3e7b','Trips','trips',1,1,1,0,'1694001430430',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('9b404def-7727-47ba-be17-bea90fe36945','a54fdbb1-78b4-4364-aaea-e6da130bd5d3','Live Tracking','livetracking',1,1,1,0,'1694001458551',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('cc2aef72-e261-43df-bf5a-d371963f55d8','a54fdbb1-78b4-4364-aaea-e6da130bd5d3','Employee','employee',1,1,1,0,'1694001458551',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('726dc3e4-9fe1-49ab-856d-c1a71227d0c7','a54fdbb1-78b4-4364-aaea-e6da130bd5d3','Trips','trips',1,1,1,0,'1694001458552',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('57ecb973-9679-4cc4-a427-bf0f9a4e4e31','e976ed68-54b3-4644-b2bb-e1380decba98','Live Tracking','livetracking',1,1,1,0,'1694071866519',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('c848cf51-d41f-470c-ad6a-a38d6b07e0fa','e976ed68-54b3-4644-b2bb-e1380decba98','Employee','employee',1,1,1,0,'1694071866519',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('e97f80f0-5706-4481-878c-da6a7213dfe1','e976ed68-54b3-4644-b2bb-e1380decba98','Trips','trips',1,1,1,0,'1694071866519',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('a80f5896-d007-4dd0-8816-f8457fd00460','85e6227a-39ce-4187-82bf-d67d423839d7','Live Tracking','livetracking',1,1,1,0,'1694074218118',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('4cac8c22-ed13-4b37-a033-2ecfccc5537b','85e6227a-39ce-4187-82bf-d67d423839d7','Employee','employee',1,1,1,0,'1694074218118',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('638fd6f1-f055-48f8-b8a5-2e1cf86e7b7f','85e6227a-39ce-4187-82bf-d67d423839d7','Trips','trips',1,1,1,0,'1694074218118',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1'),('8dd1019b-bf1f-44b6-a112-67c10c1a4ad9','b867c562-0f4d-4ad0-915a-9f72776c3135','Live Tracking','livetracking',1,1,1,0,'1694166308401',NULL,'VO_1d54989c8',NULL,'e88acca1-2166-4b28-bdcb-5544e1b561f7'),('e1737ad7-5ede-4bea-b5a2-d0f659998db3','09b7e536-05e4-48de-ae04-f4ac91428e4e','Live Tracking','livetracking',1,1,1,0,'1694166709985',NULL,'VO_1789d59c0',NULL,'e88acca1-2166-4b28-bdcb-5544e1b561f7'),('43fbcf9f-b9b8-4005-bbd7-23e491a6f081','c90514ae-ffc2-46b9-b7c1-7aea71ed2fe8','Live Tracking','livetracking',1,1,1,0,'1694166897739',NULL,'VO_b17c85f82',NULL,'e6fd463d-97d7-49b0-9ffc-25751c9f8140');
/*!40000 ALTER TABLE `role_access` ENABLE KEYS */;
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
