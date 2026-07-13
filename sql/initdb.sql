CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','cashier') NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propertyCode VARCHAR(20) UNIQUE,

    owner VARCHAR(150) NOT NULL,
    ownerPhone VARCHAR(30),

    occupant VARCHAR(150) NOT NULL,
    occupantPhone VARCHAR(30),

    description TEXT,

    floor VARCHAR(50),

    propertyType ENUM(
        'Residential',
        'Commercial',
        'Agricultural',
        'Warehouse',
        'Land',
        'Other'
    ) NOT NULL,

    neighborhood VARCHAR(125) NOT NULL,

    hasWater BOOLEAN DEFAULT FALSE,
    hasTrash BOOLEAN DEFAULT FALSE,
    hasExemption BOOLEAN DEFAULT FALSE,
    category ENUM('A','B','C','D') NOT NULL DEFAULT 'D',

    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE bills (
    id INT AUTO_INCREMENT PRIMARY KEY,

    billNumber VARCHAR(30) UNIQUE NOT NULL,

    billCode VARCHAR(30) UNIQUE,

    propertyId INT NOT NULL,

    billType ENUM('Water','Trash') NOT NULL,

    year INT NOT NULL,
    month INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    status ENUM('Pending','Paid','Cancelled') DEFAULT 'Pending',

    paymentDate DATETIME NULL,

    receiptNumber VARCHAR(30),

    receivedByUserId INT,

    notes TEXT,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(propertyId)
        REFERENCES properties(id),

    FOREIGN KEY(receivedByUserId)
        REFERENCES users(id)
);