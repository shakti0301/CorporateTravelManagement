CREATE DATABASE EmployeeTravelManagement;

USE EmployeeTravelManagement;

-- Roles
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Department
CREATE TABLE Department (
    DeptID INT IDENTITY(1,1) PRIMARY KEY,
    DeptName VARCHAR(100) NOT NULL,
    ManagerID INT,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Users
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(150) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Grade VARCHAR(20),
    RoleID INT,
    DeptID INT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,

    CONSTRAINT FK_Users_Role FOREIGN KEY (RoleID) REFERENCES Roles(RoleID),
    CONSTRAINT FK_Users_Department FOREIGN KEY (DeptID) REFERENCES Department(DeptID)
);

-- PolicyRules
CREATE TABLE PolicyRules (
    PolicyID INT IDENTITY(1,1) PRIMARY KEY,
    Grade VARCHAR(20),
    BudgetLimit DECIMAL(10,2),
    AllowedClass VARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- StatusMaster
CREATE TABLE StatusMaster (
    StatusID INT IDENTITY(1,1) PRIMARY KEY,
    StatusName VARCHAR(50) NOT NULL
);

-- TravelRequest
CREATE TABLE TravelRequest (
    RequestID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT,
    Source VARCHAR(150),
    Destination VARCHAR(150),
    TravelDate DATE,
    ReturnDate DATE,
    Purpose VARCHAR(255),
    EstimatedBudget DECIMAL(10,2),
    StatusID INT,
    PolicyID INT,
    IsDeleted BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    CreatedBy INT,

    CONSTRAINT FK_TR_User FOREIGN KEY (UserID) REFERENCES Users(UserID),
    CONSTRAINT FK_TR_Status FOREIGN KEY (StatusID) REFERENCES StatusMaster(StatusID),
    CONSTRAINT FK_TR_Policy FOREIGN KEY (PolicyID) REFERENCES PolicyRules(PolicyID)
);

-- ApprovalWorkflow
CREATE TABLE ApprovalWorkflow (
    ApprovalID INT IDENTITY(1,1) PRIMARY KEY,
    RequestID INT,
    ApproverID INT,
    Level INT,
    StatusID INT,
    Comments VARCHAR(255),
    ActionDate DATETIME,

    CONSTRAINT FK_AW_Request FOREIGN KEY (RequestID) REFERENCES TravelRequest(RequestID),
    CONSTRAINT FK_AW_User FOREIGN KEY (ApproverID) REFERENCES Users(UserID),
    CONSTRAINT FK_AW_Status FOREIGN KEY (StatusID) REFERENCES StatusMaster(StatusID)
);

-- Itinerary
CREATE TABLE Itinerary (
    ItineraryID INT IDENTITY(1,1) PRIMARY KEY,
    RequestID INT,
    SegmentType VARCHAR(50),
    FromLocation VARCHAR(100),
    ToLocation VARCHAR(100),
    DepartureTime DATETIME,
    StayDetails VARCHAR(255),

    CONSTRAINT FK_Itinerary_Request FOREIGN KEY (RequestID) REFERENCES TravelRequest(RequestID)
);

-- Expense
CREATE TABLE Expense (
    ExpenseID INT IDENTITY(1,1) PRIMARY KEY,
    RequestID INT,
    Category VARCHAR(100),
    Amount DECIMAL(10,2),
    ExpenseDate DATE,
    ProofFilePath VARCHAR(255),
    FileName VARCHAR(100),
    FileSize INT,
    ReimbursementStatus VARCHAR(50),

    CONSTRAINT FK_Expense_Request FOREIGN KEY (RequestID) REFERENCES TravelRequest(RequestID)
);

-- AuditLog
CREATE TABLE AuditLog (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    RequestID INT,
    ChangedByID INT,
    OldStatusID INT,
    NewStatusID INT,
    ChangedAt DATETIME DEFAULT GETDATE(),
    Remarks VARCHAR(255),

    CONSTRAINT FK_AL_Request FOREIGN KEY (RequestID) REFERENCES TravelRequest(RequestID),
    CONSTRAINT FK_AL_User FOREIGN KEY (ChangedByID) REFERENCES Users(UserID),
    CONSTRAINT FK_AL_OldStatus FOREIGN KEY (OldStatusID) REFERENCES StatusMaster(StatusID),
    CONSTRAINT FK_AL_NewStatus FOREIGN KEY (NewStatusID) REFERENCES StatusMaster(StatusID)
);

-- Notifications
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT,
    Message VARCHAR(255),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Notification_User FOREIGN KEY (UserID) REFERENCES Users(UserID)
);


--Indexes
CREATE INDEX idx_tr_user ON TravelRequest(UserID);
CREATE INDEX idx_tr_status ON TravelRequest(StatusID);
CREATE INDEX idx_exp_request ON Expense(RequestID);
CREATE INDEX idx_aw_request ON ApprovalWorkflow(RequestID);