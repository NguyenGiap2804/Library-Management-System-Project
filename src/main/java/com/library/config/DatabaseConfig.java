package com.library.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class DatabaseConfig {
    private static final String DEFAULT_URL =
            "jdbc:sqlserver://DESKTOP-T11NI5C\\MSSQLSERVER01;"
                    + "databaseName=LibraryManagementDemo;"
                    + "encrypt=true;"
                    + "trustServerCertificate=true;";
    private static final String DEFAULT_USER = "sa";
    private static final String DEFAULT_PASSWORD = "sa123";

    private DatabaseConfig() {
    }

    public static Connection getConnection() throws SQLException {
        String url = getEnvOrDefault("LMS_DB_URL", DEFAULT_URL);
        String user = getEnvOrDefault("LMS_DB_USER", DEFAULT_USER);
        String password = getEnvOrDefault("LMS_DB_PASSWORD", DEFAULT_PASSWORD);

        return DriverManager.getConnection(url, user, password);
    }

    private static String getEnvOrDefault(String key, String defaultValue) {
        String value = System.getenv(key);
        return value == null || value.trim().isEmpty() ? defaultValue : value;
    }
}
