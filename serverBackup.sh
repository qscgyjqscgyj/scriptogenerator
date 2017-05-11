#!/bin/bash
SHELL=/bin/sh PATH=/bin:/sbin:/usr/bin:/usr/sbin
# Database credentials
 DB_USER="root"
 DB_PASS="201alpateks201"
 DB_HOST="localhost"
 DB_NAME="scripts"
# Other options
 DB_PATH="../"
 DATE=$(date +"%d-%b-%Y-%T")
# Set default file permissions
 umask 177
# Dump database into SQL file
 mysqldump --user=$DB_USER --password=$DB_PASS --host=$DB_HOST $DB_NAME > $DB_PATH/$DB_NAME-$DATE.sql

BACKUP_DIR="../scripts"
PROJECT_NAME="scripts"
BACKUP_PATH="../dumps/scripts/"



#Compress
tar -cvf $BACKUP_PATH$PROJECT_NAME-$DATE.tar $BACKUP_DIR
tar -uvf $BACKUP_PATH$PROJECT_NAME-$DATE.tar $DB_PATH/$DB_NAME-$DATE.sql
gzip $BACKUP_PATH$PROJECT_NAME-$DATE.tar

rm $DB_PATH/$DB_NAME-$DATE.sql

# Delete files older than 3 days
find ../dumps/scripts/* -mtime +3 -exec rm {} \;