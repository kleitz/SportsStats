# SportsStats

This is a php/javascript webapp used to graph basketball stats.

## Compatible Sports

1. NCAA Men's College Basketball
2. NBA

## Installation

Make sure to run `bower install`

Add database tables

Set up `app/api/classes/dbvars.php`

`<?php`

`define('DB_HOST', '***');`

`define('DB_USER', '***');`

`define('DB_PASSWORD', '***');`

`define('DB_NAME', '***');`

`?>`

Run `gulp all` to ensure javascript is concatenated and SASS script is compiled