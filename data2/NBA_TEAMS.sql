-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Aug 03, 2015 at 07:35 AM
-- Server version: 5.1.44
-- PHP Version: 5.3.1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `SPORTS_STATS`
--

-- --------------------------------------------------------

--
-- Table structure for table `NBA_TEAMS`
--

CREATE TABLE IF NOT EXISTS `NBA_TEAMS` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `CITY` varchar(32) CHARACTER SET latin1 NOT NULL,
  `ABBR_NAME` varchar(5) CHARACTER SET latin1 NOT NULL,
  `PRIMARY_COLOR` char(6) CHARACTER SET latin1 NOT NULL,
  `SECONDARY_COLOR` char(6) CHARACTER SET latin1 NOT NULL,
  `CONFERENCE` char(4) CHARACTER SET latin1 NOT NULL,
  `DIVISION` varchar(9) CHARACTER SET latin1 NOT NULL,
  `TEAM_NAME` varchar(32) CHARACTER SET latin1 NOT NULL,
  `WikiColor` tinyint(1) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci AUTO_INCREMENT=31 ;

--
-- Dumping data for table `NBA_TEAMS`
--

INSERT INTO `NBA_TEAMS` (`ID`, `CITY`, `ABBR_NAME`, `PRIMARY_COLOR`, `SECONDARY_COLOR`, `CONFERENCE`, `DIVISION`, `TEAM_NAME`, `WikiColor`) VALUES
(1, 'Brooklyn', 'BKN', '000000', 'FFFFFF', 'East', 'Atlantic', 'Nets', 0),
(2, 'Boston', 'BOS', '009E60', 'FFFFFF', 'East', 'Atlantic', 'Celtics', 0),
(3, 'New York', 'NYK', '006BB6', 'F58426', 'East', 'Atlantic', 'Knicks', 1),
(4, 'Philadelphia', 'PHI', '006BB6', 'ED174C', 'East', 'Atlantic', '76ers', 1),
(5, 'Toronto', 'TOR', 'CE1141', 'A1A1A4', 'East', 'Atlantic', 'Raptors', 1),
(6, 'Chicago', 'CHI', 'CE1141', '000000', 'East', 'Central', 'Bulls', 1),
(7, 'Cleveland', 'CLE', '002D62', '860038', 'East', 'Central', 'Cavaliers', 1),
(8, 'Detroit', 'DET', '006BB6', 'ED174C', 'East', 'Central', 'PIstions', 1),
(9, 'Indiana', 'IND', 'FFC632', '00285E', 'East', 'Central', 'Pacers', 1),
(10, 'Milwaukee', 'MIL', '0077C0', 'EEE1C6', 'East', 'Central', 'Bucks', 1),
(11, 'Atlanta', 'ATL', 'E03A3E', '000000', 'East', 'Southeast', 'Hawks', 1),
(12, 'Charlotte', 'CHA', '008CA8', '000000', 'East', 'Southeast', 'Hornets', 1),
(13, 'Miami', 'MIA', '98002E', 'F9A01B', 'East', 'Southeast', 'Heat', 1),
(14, 'Orlando', 'ORL', '007DC5', 'C4CED4', 'East', 'Southeast', 'Magic', 1),
(15, 'Washington', 'WAS', 'E31937', '002D62', 'East', 'Southeast', 'Wizards', 1),
(16, 'Denver', 'DEN', '4D90CD', 'FDB927', 'West', 'Northwest', 'Nuggets', 1),
(17, 'Minnesota', 'MIN', '005083', '00A94F', 'West', 'Northwest', 'Timberwolves', 1),
(18, 'Oklahoma City', 'OKC', '007DC3', 'F05133', 'West', 'Northwest', 'Thunder', 1),
(19, 'Portland', 'POR', 'BBC4CA', 'E03A3E', 'West', 'Northwest', 'Trail Blazers', 1),
(20, 'Utah', 'UTAH', '002B5C', 'F9A01B', 'West', 'Northwest', 'Jazz', 1),
(21, 'Golden State', 'GS', '006BB6', 'FDB927', 'West', 'Pacific', 'Warriors', 1),
(22, 'Los Angeles', 'LAC', '006BB6', 'ED174C', 'West', 'Pacific', 'Clippers', 1),
(23, 'Los Angeles', 'LAL', 'FDB927', '552582', 'West', 'Pacific', 'Lakers', 1),
(24, 'Phoenix', 'PHO', 'E56020', '000000', 'West', 'Pacific', 'Suns', 1),
(25, 'Sacramento', 'SAC', '724C9F', '8E9090', 'West', 'Pacific', 'Kings', 1),
(26, 'Dallas', 'DAL', '007DC5', 'C4CED4', 'West', 'Southwest', 'Mavericks', 1),
(27, 'Houston', 'HOU', 'CE1141', 'C4CED4', 'West', 'Southwest', 'Rockets', 1),
(28, 'Memphis', 'MEM', '00285E', '7399C6', 'West', 'Southwest', 'Grizzlies', 1),
(29, 'New Orleans', 'NO', '002B5C', 'B4975A', 'West', 'Southwest', 'Pelicans', 1),
(30, 'San Antonio', 'SAS', 'BBC4CA', '000000', 'West', 'Southwest', 'Spurs', 1);
