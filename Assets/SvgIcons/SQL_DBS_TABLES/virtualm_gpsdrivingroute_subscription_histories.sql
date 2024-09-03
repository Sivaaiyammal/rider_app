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
-- Table structure for table `subscription_histories`
--

DROP TABLE IF EXISTS `subscription_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_histories` (
  `id` varchar(255) NOT NULL,
  `subscription_id` varchar(255) NOT NULL,
  `plan_id` varchar(255) NOT NULL,
  `plan_name` varchar(255) NOT NULL,
  `plan_amount` bigint NOT NULL,
  `office_id` varchar(255) NOT NULL,
  `trial_period_start_date` varchar(255) NOT NULL,
  `trial_period_end_date` varchar(255) NOT NULL,
  `subscribed_after_trial` bigint DEFAULT NULL COMMENT '0 - NO\\n1 - Yes',
  `date_subdcribed` varchar(255) DEFAULT NULL,
  `date_unsubdcribed` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) NOT NULL,
  `updated_at` varchar(255) DEFAULT NULL,
  `created_by` varchar(255) NOT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `duration_type` bigint DEFAULT NULL COMMENT '0 - Free Trial\\n1 - Monthly\\n2- Yearly',
  `duration` bigint DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `transaction_type` bigint DEFAULT NULL COMMENT '0 - Cash\\n1 - UPI\\n2 - Card\\n3 - NEFT',
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_histories_subscription_id_unique` (`subscription_id`),
  UNIQUE KEY `subscription_histories_plan_id_unique` (`plan_id`),
  UNIQUE KEY `subscription_histories_office_id_unique` (`office_id`),
  UNIQUE KEY `subscription_histories_transaction_id_unique` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_histories`
--

LOCK TABLES `subscription_histories` WRITE;
/*!40000 ALTER TABLE `subscription_histories` DISABLE KEYS */;
INSERT INTO `subscription_histories` VALUES ('2290c82d-b077-4812-a1a4-c0cef84cd5cc','e6df2ae6-e8c0-45ab-836a-7ce71f29c1c7','de03e98f-6500-4b30-9544-c9d82f2f1f98','Basic',250,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1','','',1,'1693826706782','1709594844845.012','1693826706782',NULL,'e8543c4d-69ba-49c6-bcfb-67b35d97e8f1',NULL,1,6,'e6aoiuksddf2ae6-e6aoiuksddf2ae6',1);
/*!40000 ALTER TABLE `subscription_histories` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-05 10:52:04
