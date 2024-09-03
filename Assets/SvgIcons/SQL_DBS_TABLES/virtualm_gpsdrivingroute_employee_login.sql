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
-- Table structure for table `employee_login`
--

DROP TABLE IF EXISTS `employee_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_login` (
  `employee_id` varchar(255) NOT NULL,
  `office_id` varchar(45) NOT NULL,
  `plan_id` varchar(255) DEFAULT NULL,
  `role_id` varchar(45) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `status` int DEFAULT '0' COMMENT '0 - InActive , 1 - Active',
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `verify_otp` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) NOT NULL,
  `updated_at` varchar(255) DEFAULT NULL,
  `isregisterVerified` int DEFAULT '0' COMMENT '0 - No\n1 - Yes',
  `forgetPassOTP` varchar(45) DEFAULT NULL,
  `role_category` int DEFAULT NULL COMMENT '0-Default\n1-Client\n2-Vendor\n3-Operator',
  `role_type` int DEFAULT NULL COMMENT '0-Default\n1-Admin\n2-Employee',
  PRIMARY KEY (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_login`
--

LOCK TABLES `employee_login` WRITE;
/*!40000 ALTER TABLE `employee_login` DISABLE KEYS */;
INSERT INTO `employee_login` VALUES ('ID_c6e2caa55','e88acca1-2166-4b28-bdcb-5544e1b561f7','','c38d3b98-3f0c-4fff-b620-cb32bbc816bc','employee 01','123456789',1,'employeegmail.com','$2b$10$qGsnnbkmXqwx7qDLIBr6WOMMOLQ3EC6goj2nl9gVvjS.zoVNr/JLa','633355','1694682328543',NULL,1,'512541',1,2);
/*!40000 ALTER TABLE `employee_login` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-14 15:05:01
