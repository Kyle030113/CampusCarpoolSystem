/*
 Navicat Premium Data Transfer

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 80031
 Source Host           : localhost:3306
 Source Schema         : 5003

 Target Server Type    : MySQL
 Target Server Version : 80031
 File Encoding         : 65001

 Date: 10/12/2025 09:36:51
*/

CREATE DATABASE `5003` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `5003`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for carpool
-- ----------------------------
DROP TABLE IF EXISTS `carpool`;
CREATE TABLE `carpool`  (
  `carpool_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `origin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `origin_detail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `destination` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `destination_detail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `departure_time` datetime NOT NULL,
  `remarks` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `status` tinyint NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`carpool_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of carpool
-- ----------------------------
INSERT INTO `carpool` VALUES ('15fe4178-f53e-474c-a9be-01df6b80efc8', '广州市', '越秀区', '深圳市', '罗湖区', '2025-12-17 09:32:00', '', 1, 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `carpool` VALUES ('271cde44-b6b5-4890-aa8a-4c1deb1ed8de', '深圳市', '南山区', '广州市', '海珠区', '2025-12-12 09:31:00', '', 1, 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `carpool` VALUES ('5c64ef76-c1ff-443f-a97f-6d355d9b05d9', '东莞市', '大朗镇', '广州市', '南沙区', '2025-12-12 10:31:00', '', 1, 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `carpool` VALUES ('a36b9f31-78f3-45d7-acdc-9aa3c1f0c3f7', '深圳市', '宝安区', '东莞市', '大朗镇', '2025-12-17 21:30:00', '', 1, 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `carpool` VALUES ('af0a9747-d84e-427d-91d3-2aebf755752e', '东莞市', '大朗镇', '广州市', '海珠区', '2025-12-11 09:27:00', 'only girl', 1, 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `carpool` VALUES ('d3dceb10-4835-4b77-93dd-fb40a0d85ef3', '广州市', '白云区', '东莞市', '大朗镇', '2025-12-14 16:32:00', '', 1, 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `carpool` VALUES ('d53ccc68-e483-4ae4-87ce-41843a02049d', '东莞市', '大朗镇', '深圳市', '罗湖区', '2025-12-14 12:31:00', '', 1, 'f527956c-6f85-4988-9c09-5c52f593c1ba');

-- ----------------------------
-- Table structure for participant
-- ----------------------------
DROP TABLE IF EXISTS `participant`;
CREATE TABLE `participant`  (
  `participant_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `carpool_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`participant_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of participant
-- ----------------------------
INSERT INTO `participant` VALUES ('129687de-ff61-4f68-8666-a842f7f4a298', 'd3dceb10-4835-4b77-93dd-fb40a0d85ef3', 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `participant` VALUES ('17f692e1-7e65-408b-894c-bbbce4b8a6b5', '7308771d-be1c-44c1-bc0f-1b4c78c9b9ac', '161aec9e-7766-4d94-b37b-c90f614ec612');
INSERT INTO `participant` VALUES ('22b43599-9dfd-4d3b-8809-083781ca7705', '271cde44-b6b5-4890-aa8a-4c1deb1ed8de', 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `participant` VALUES ('4c4d172d-e368-4dfa-878c-081cd846dca8', '5c64ef76-c1ff-443f-a97f-6d355d9b05d9', 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `participant` VALUES ('761ccff7-b7f4-4e01-9e3f-f955080aea6b', 'af0a9747-d84e-427d-91d3-2aebf755752e', 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `participant` VALUES ('86598e25-635b-46c6-a268-b4c0eed1d59b', 'a36b9f31-78f3-45d7-acdc-9aa3c1f0c3f7', 'ed696b46-2945-4772-b6b8-ba8700f9ac51');
INSERT INTO `participant` VALUES ('86c3dfde-9eaa-4f83-b977-8875e632a799', '15fe4178-f53e-474c-a9be-01df6b80efc8', 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `participant` VALUES ('ad5a306e-ce30-4d44-8d7e-06bf2d130804', '99e05ed4-7589-4489-a0d5-b5406850547b', '161aec9e-7766-4d94-b37b-c90f614ec612');
INSERT INTO `participant` VALUES ('d6dfb08e-6071-4fb5-ae8a-693e8267cb86', 'd53ccc68-e483-4ae4-87ce-41843a02049d', 'f527956c-6f85-4988-9c09-5c52f593c1ba');
INSERT INTO `participant` VALUES ('e3ba0e77-05eb-443f-b371-b9617549919b', 'a36b9f31-78f3-45d7-acdc-9aa3c1f0c3f7', 'f527956c-6f85-4988-9c09-5c52f593c1ba');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `user_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `open_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `wechat_nickname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `phone_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('161aec9e-7766-4d94-b37b-c90f614ec612', 'openid_0e3mZZFa128SMK0slXFa12oHgP0mZZF5', NULL, 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132', '');
INSERT INTO `user` VALUES ('7e735048-1b25-4ffd-96d7-d92d7604beca', 'openid_0c3jCqFa1rcwNK0WA5Ha11caSm0jCqFE', NULL, 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132', '12222222');
INSERT INTO `user` VALUES ('85428ae5-ca4d-40b8-89a4-540b0a145066', 'openid_0b3XQqFa1LqxNK0ZozIa1dW9nf1XQqFb', NULL, 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132', '');
INSERT INTO `user` VALUES ('ed696b46-2945-4772-b6b8-ba8700f9ac51', 'openid_0c3vMcnl2v2OLg4QFQml23rgCJ0vMcnI', NULL, 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132', '');
INSERT INTO `user` VALUES ('f527956c-6f85-4988-9c09-5c52f593c1ba', 'openid_0d3MOIkl2LDHNg4vXbll20tME23MOIk7', NULL, 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132', '');

SET FOREIGN_KEY_CHECKS = 1;
