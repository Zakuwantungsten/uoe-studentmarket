# Student Marketplace System Diagrams

This document contains text-based representations of the Use Case Diagram, Data Flow Diagram (DFD), and Entity-Relationship Diagram (ERD) for the Student Marketplace system.

## 1. Use Case Diagram

```
+-----------------------------------------------------------------------+
|                      STUDENT MARKETPLACE SYSTEM                        |
|                                                                       |
|  +-----------------------+        +--------------------------+        |
|  |  Authentication       |        |  Service Management      |        |
|  |-----------------------|        |--------------------------|        |
|  | - Register Account    |        | - Create Service         |        |
|  | - Login/Logout        |        | - Update Service         |        |
|  | - Update Profile      |        | - Delete Service         |        |
|  | - Delete Account      |<-------| - Manage Features        |        |
|  | - View Dashboard      |        | - Browse/Search Services |        |
|  +-----------------------+        | - Filter Services        |        |
|                                   | - View Service Details   |        |
|                                   +--------------------------+        |
|                                            ^                          |
|                                            |                          |
|                                            |                          |
|  +-----------------------+        +--------------------------+        |
|  |  Booking Management   |        |  Review System           |        |
|  |-----------------------|        |--------------------------|        |
|  | - Create Booking      |------->| - Submit Review          |        |
|  | - View Booking        |        | - View Reviews           |        |
|  | - Update Status       |        | - Manage Reviews         |        |
|  | - Cancel Booking      |        +--------------------------+        |
|  | - Check Availability  |                                           |
|  | - View History        |        +--------------------------+        |
|  +-----------------------+        |  Payment Processing      |        |
|            ^                      |--------------------------|        |
|            |                      | - Process Payment        |        |
|            |                      | - View Transactions      |        |
|            |                      | - Refund Payment         |        |
|            |                      | - Track Earnings         |        |
|            |                      +--------------------------+        |
|  +-----------------------+                  ^                         |
|  |  Communication        |                  |                         |
|  |-----------------------|                  |                         |
|  | - Send/Receive Msgs   |        +--------------------------+        |
|  | - Manage Conversations|        |  Community Features      |        |
|  +-----------------------+        |--------------------------|        |
|                                   | - Create/Join Groups     |        |
|                                   | - Create/Attend Events   |        |
|                                   | - Post/View Discussions  |        |
|                                   | - Comment on Discussions |        |
|  +-----------------------+        +--------------------------+        |
|  |  Admin Functions      |                                           |
|  |-----------------------|                                           |
|  | - Manage Users        |                                           |
|  | - Manage Services     |                                           |
|  | - Handle Disputes     |                                           |
|  | - Generate Reports    |                                           |
|  | - Send Announcements  |                                           |
|  | - Manage Support Tix  |                                           |
|  | - Monitor Finances    |                                           |
|  +-----------------------+                                           |
|                                                                       |
+-----------------------------------------------------------------------+

 ^           ^           ^                ^                  ^
 |           |           |                |                  |
 |           |           |                |                  |
 |           |           |                |                  |
+------+  +-------+  +----------+  +-----------+  +------------------+
|Guest |  |  User  |  |Provider |  |  Admin    |  | Payment System   |
|User  |  |        |  |         |  |           |  |                  |
+------+  +-------+  +----------+  +-----------+  +------------------+

/* Relationships Legend:
 * ------> : «include» relationship
 * - - - > : «extend» relationship
 * ━━━━━━> : generalization relationship
 */
```

### Actor Descriptions:
- **Guest User**: Unregistered visitor to the platform
- **User**: Registered student who can browse and book services
- **Provider**: Student who offers services (specialization of User)
- **Admin**: System administrator with elevated privileges
- **Payment System**: External payment processing system

### Relationship Examples:
- Login «include» Authentication (Authentication is included in login process)
- Update Service «extend» Add Service Features (Adding features extends updating)
- User generalizes to Provider (Provider is a specialized type of User)

## 2. Data Flow Diagrams (DFD)

### 2.1 Level 0 DFD (Context Diagram)

The Level 0 DFD, also known as the Context Diagram, provides a high-level view of the student marketplace system and its interactions with external entities.

```
              +-------------------------+
              |                         |
              |                         |
+----------+  |                         |  +----------+
|  Guest   |--|       STUDENT           |--|  Admin   |
|  User    |<-|      MARKETPLACE        |<-|          |
+----------+  |        SYSTEM           |  +----------+
              |                         |
              |                         |
+----------+  |                         |  +----------+
| Registered|--|                         |--| Payment  |
|  User    |<-|                         |<-| System   |
+----------+  |                         |  +----------+
              |                         |
              |                         |
+----------+  |                         |
| Service  |--|                         |
| Provider |<-|                         |
+----------+  +-------------------------+
```

#### External Entities:
1. **Guest User**: Unregistered visitors who can browse services and register
2. **Registered User**: Students who can book services and manage their accounts
3. **Service Provider**: Students who offer services on the platform
4. **Admin**: System administrators who manage the platform
5. **Payment System**: External payment processing system

#### Data Flows:
- Guest User → System: Registration requests, Service browsing
- System → Guest User: Service information, Registration confirmation
- Registered User → System: Login credentials, Booking requests, Profile updates
- System → Registered User: Service information, Booking confirmations, Notifications
- Service Provider → System: Service listings, Booking responses, Profile updates
- System → Service Provider: Booking notifications, Earnings information
- Admin → System: Administrative commands, Settings updates
- System → Admin: Reports, Statistics, User information
- System → Payment System: Payment requests
- Payment System → System: Payment confirmations

### 2.2 Level 1 DFD

The Level 1 DFD breaks down the main system into its major processes and data stores.

```
+----------+                   +-------------+                      +----------+
|  Guest   |--Registration---->| 1.0         |                      |  Admin   |
|  User    |<---Confirmation---|Authentication|<----Admin Login-----|          |
+----------+                   |  System     |                      +----------+
     |                         +-------------+                           |
     |                              |  |                                 |
     |                              |  |                                 |
     |                              v  v                                 v
     |                         +-------------+                      +----------+
     |                         |    D1       |                      | 7.0      |
     |                         |  User Data  |<-------------------->|Admin     |
     |                         +-------------+                      |Dashboard |
     |                              ^  ^                            +----------+
     |                              |  |                                 ^
     |                              |  |                                 |
     |                         +-------------+                      +----------+
     |                         | 2.0         |                      |    D7    |
     |-----Search/Browse------>|Service      |<-------------------->|Reports   |
     |<----Service Results-----|Management   |                      |Data      |
     |                         +-------------+                      +----------+
     |                              |  |
     |                              |  |
     |                              v  v
+----------+                   +-------------+                      +----------+
|Registered|<--Service Info----|    D2       |                      |Payment   |
|  User    |--Booking Request->|Service Data |                      |System    |
+----------+                   +-------------+                      +----------+
     |                              ^                                    ^
     |                              |                                    |
     v                              v                                    |
+-------------+                +-------------+                           |
| 3.0         |                | 4.0         |                           |
|User Profile |                |Booking      |-------------------------->|
|Management   |                |System       |                           |
+-------------+                +-------------+                           |
     ^                              |  |                                 |
     |                              |  |                                 |
     |                              v  v                                 |
     |                         +-------------+                           |
     |                         |    D3       |                           |
     |                         |Booking Data |                           |
     |                         +-------------+                           |
     |                              ^  |                                 |
     |                              |  v                                 |
+----------+                   +-------------+                           |
|Service   |<--Booking Notice--|5.0          |                           |
|Provider  |--Service Updates->|Notification |                           |
+----------+                   |System       |                           |
     |                         +-------------+                           |
     |                              ^                                    |
     |                              |                                    |
     v                              v                                    |
+-------------+                +-------------+                           |
| 6.0         |                |    D4       |                           |
|Communication|                |Transaction  |<--------------------------|
|System       |                |Data         |
+-------------+                +-------------+
     |                              ^
     |                              |
     v                              v
+-------------+                +-------------+
|    D5       |                | 8.0         |
|Message Data |                |Review       |
+-------------+                |System       |
                               +-------------+
                                    |  |
                                    v  v
                               +-------------+
                               |    D6       |
                               |Review Data  |
                               +-------------+
```

#### Processes:
1. **Authentication System (1.0)**: Handles user registration and login
2. **Service Management (2.0)**: Manages service listings and searches
3. **User Profile Management (3.0)**: Handles user profile information
4. **Booking System (4.0)**: Processes service bookings
5. **Notification System (5.0)**: Manages system notifications
6. **Communication System (6.0)**: Handles messaging between users
7. **Admin Dashboard (7.0)**: Provides administrative controls
8. **Review System (8.0)**: Manages service reviews

#### Data Stores:
- **D1: User Data**: Stores user account information
- **D2: Service Data**: Stores service listings
- **D3: Booking Data**: Stores booking information
- **D4: Transaction Data**: Stores payment information
- **D5: Message Data**: Stores user communications
- **D6: Review Data**: Stores service reviews
- **D7: Reports Data**: Stores system reports and analytics

#### Key Data Flows:

1. **Authentication Flows**:
   - Guest User → Authentication System: Registration information
   - Authentication System → User Data: Store user information
   - Authentication System → Guest User: Registration confirmation

2. **Service Management Flows**:
   - Service Provider → Service Management: Service listing details
   - Service Management → Service Data: Store service information
   - Registered User → Service Management: Search/browse requests
   - Service Management → Registered User: Service results

3. **Booking Flows**:
   - Registered User → Booking System: Booking request
   - Booking System → Booking Data: Store booking information
   - Booking System → Payment System: Payment processing request
   - Payment System → Transaction Data: Payment confirmation
   - Booking System → Notification System: Booking notification
   - Notification System → Service Provider: Booking notice

4. **Admin Flows**:
   - Admin → Admin Dashboard: Administrative requests
   - Admin Dashboard → User Data/Service Data/Booking Data: Data queries
   - Admin Dashboard → Reports Data: Store generated reports

### 2.3 General DFD

The following diagram shows a more detailed view of data flows in the system:

```
                      +------------------+
                      |   Guest User     |
                      +------------------+
                              |
                              | Registration Data
                              v
+------------------+    +-----------------+     +------------------+
|                  |    |                 |     |                  |
|   User Database  |<-->| Authentication  |---->|  Email Service   |
|                  |    |    System       |     |                  |
+------------------+    +-----------------+     +------------------+
        ^                      |
        |                      | User Data
        |                      v
        |              +-----------------+
        |              |   User Profile  |     +------------------+
        |              |   Management    |<--->|  Skills/Education|
        |              +-----------------+     |     Database     |
        |                      |               +------------------+
        |                      |
        |                      |
+------------------+    +-----------------+     +------------------+
|                  |    |                 |     |                  |
|Category Database |<-->|  Service Listing|<--->| Service Database |
|                  |    |   Management    |     |                  |
+------------------+    +-----------------+     +------------------+
                              |
                              |
                              v
+------------------+    +-----------------+     +------------------+
|                  |    |                 |     |                  |
| Booking Database |<-->| Booking System  |<--->| Provider         |
|                  |    |                 |     | Notification     |
+------------------+    +-----------------+     +------------------+
        |                      |
        |                      | Payment Request
        |                      v
        |              +-----------------+     +------------------+
        |              |    Payment      |<--->|  Payment Gateway |
        |              |   Processing    |     |                  |
        |              +-----------------+     +------------------+
        |                      |
        |                      | Transaction Data
        v                      v
+------------------+    +-----------------+     +------------------+
|                  |    |                 |     |                  |
|Review Database   |<-->|  Review System  |<--->| Service Ratings  |
|                  |    |                 |     | Update           |
+------------------+    +-----------------+     +------------------+
        |                      |
        |                      |
        v                      v
+------------------+    +-----------------+     +------------------+
|                  |    |                 |     |                  |
|Message Database  |<-->|  Messaging      |<--->| Notification     |
|                  |    |  System         |     | System           |
+------------------+    +-----------------+     +------------------+
                              |
                              |
+------------------+          |           +------------------+
|                  |          |           |                  |
|Discussion/Comment|<---------|---------->|  Group/Event     |
|Database          |          |           |  Database        |
+------------------+          |           +------------------+
                              |
                              v
+------------------+    +-----------------+     +------------------+
|                  |    |                 |     |                  |
|Reports Database  |<-->|  Admin          |<--->| Support Ticket   |
|                  |    |  Dashboard      |     | Database         |
+------------------+    +-----------------+     +------------------+
```

### Overall DFD Description:
1. **Authentication Flow**: 
   - Guest users provide registration data to the Authentication System
   - The system stores user data in the User Database
   - Email verification is sent to the user

2. **Service Management Flow**:
   - Service providers submit service details to the Service Listing Management
   - The system retrieves category information from the Category Database
   - Service data is stored in the Service Database

3. **Booking Flow**:
   - Users send booking requests to the Booking System
   - The system stores booking data in the Booking Database
   - Notifications are sent to service providers
   - Payment requests are sent to the Payment Processing system
   - Payment Gateway processes payments
   - Transaction data is stored

4. **Review Flow**:
   - Users submit reviews to the Review System
   - Review data is stored in the Review Database
   - Service ratings are updated

5. **Admin Flow**:
   - Admin accesses the Admin Dashboard
   - Dashboard retrieves data from various databases
   - Reports are generated and stored
   - Support tickets are managed

## 3. Entity-Relationship Diagram (ERD)

```
+---------------+       +---------------+       +---------------+
|     User      |       |   UserSkill   |       |   Education   |
|---------------|       |---------------|       |---------------|
| id (PK)       |<---+  | id (PK)       |       | id (PK)       |
| name          |    |  | userId (FK)   |       | userId (FK)   |
| email         |    |  | skill         |       | institution   |
| password      |    |  | createdAt     |       | degree        |
| image         |    |  | updatedAt     |       | fieldOfStudy  |
| phone         |    |  +---------------+       | startDate     |
| studentId     |    |                          | endDate       |
| bio           |    |  +---------------+       | current       |
| title         |    |  | Certification |       | createdAt     |
| role          |    |  |---------------|       | updatedAt     |
| status        |    |  | id (PK)       |       +---------------+
| createdAt     |    |  | userId (FK)   |               ^
| updatedAt     |    |  | name          |               |
+---------------+    |  | organization  |               |
     ^  ^  ^     ^   |  | issueDate     |               |
     |  |  |     |   |  | expiryDate    |               |
     |  |  |     |   |  | credentialId  |               |
     |  |  |     |   |  | credentialUrl |               |
     |  |  |     |   |  | createdAt     |               |
     |  |  |     |   |  | updatedAt     |               |
     |  |  |     |   |  +---------------+               |
     |  |  |     |   |          ^                       |
     |  |  |     |   |          |                       |
     |  |  |     |   +----------+-----------------------+
     |  |  |     |
     |  |  |     |   +---------------+       +---------------+
     |  |  |     |   |   Service     |       |ServiceFeature |
     |  |  |     |   |---------------|       |---------------|
     |  |  |     |   | id (PK)       |       | id (PK)       |
     |  |  |     |   | title         |       | serviceId (FK)|
     |  |  |     |   | description   |       | feature       |
     |  |  |     |   | price         |       | createdAt     |
     |  |  |     |   | priceType     |       | updatedAt     |
     |  |  |     |   | location      |       +---------------+
     |  |  |     |   | image         |               ^
     |  |  |     |   | featured      |               |
     |  |  |     |   | discount      |               |
     |  |  |     |   | availability  |               |
     |  |  |     |   | deliveryTime  |               |
     |  |  |     |   | status        |               |
     |  |  |     +-->| providerId(FK)|               |
     |  |  |         | categoryId(FK)|---------------+
     |  |  |         | createdAt     |
     |  |  |         | updatedAt     |       +---------------+
     |  |  |         +---------------+       |   Category    |
     |  |  |                ^   ^            |---------------|
     |  |  |                |   |            | id (PK)       |
     |  |  |                |   |            | name          |
     |  |  |                |   |            | description   |
     |  |  |                |   |            | icon          |
     |  |  |                |   |            | slug          |
     |  |  |                |   |            | count         |
     |  |  |                |   |            | createdAt     |
     |  |  |                |   |            | updatedAt     |
     |  |  |  +-------------+   |            +---------------+
     |  |  |  |                 |                    ^
     |  |  |  |                 |                    |
     |  |  |  |                 +--------------------+
     |  |  |  |
     |  |  |  |   +---------------+       +---------------+       +---------------+
     |  |  |  |   |   Booking     |       |  Transaction  |       |    Review    |
     |  |  |  |   |---------------|       |---------------|       |---------------|
     |  |  |  |   | id (PK)       |       | id (PK)       |       | id (PK)       |
     |  |  |  |   | customerId(FK)|------>| amount        |       | rating        |
     |  |  +--|-->| providerId(FK)|       | currency      |       | comment       |
     |  |     |   | serviceId (FK)|       | status        |       | reviewerId(FK)|
     +--|-----|-->| date          |       | paymentMethod |       | revieweeId(FK)|
        |     |   | startTime     |       | paymentId     |<----->| serviceId (FK)|
        |     |   | endTime       |       | userId (FK)   |       | bookingId (FK)|
        |     |   | status        |       | bookingId (FK)|       | createdAt     |
        |     |   | totalAmount   |       | createdAt     |       | updatedAt     |
        |     |   | notes         |       | updatedAt     |       +---------------+
        |     |   | createdAt     |       +---------------+               ^
        |     |   | updatedAt     |                                       |
        |     |   +---------------+                                       |
        |     |          ^                                                |
        |     |          |                                                |
        |     +----------+------------------------------------------------+
        |  
        |     +---------------+       +---------------+
        |     |   Message     |       |  Discussion   |
        |     |---------------|       |---------------|
        |     | id (PK)       |       | id (PK)       |
        |     | content       |       | title         |
        |     | senderId (FK) |       | content       |
        +---->| recipientId(FK|       | authorId (FK) |<------+
              | read          |       | createdAt     |       |
              | createdAt     |       | updatedAt     |       |
              | updatedAt     |       +---------------+       |
              +---------------+               ^               |
                                              |               |
                                              |               |
                                      +---------------+       |
                                      |   Comment     |       |
                                      |---------------|       |
                                      | id (PK)       |       |
                                      | content       |       |
                                      | authorId (FK) |-------+
                                      | discussionId  |
                                      | createdAt     |
                                      | updatedAt     |
                                      +---------------+
```

### ERD Description:
This diagram shows the main entities in the system and their relationships:

1. **User-Related Entities**:
   - User has many UserSkills, Education records, and Certifications (1:N)
   - User provides many Services as a Provider (1:N)
   - User makes many Bookings as a Customer (1:N)
   - User receives many Bookings as a Provider (1:N)
   - User gives and receives many Reviews (1:N)
   - User sends and receives many Messages (1:N)
   - User authors many Discussions and Comments (1:N)

2. **Service-Related Entities**:
   - Service belongs to one Category (N:1)
   - Service has many ServiceFeatures (1:N)
   - Service has many Bookings (1:N)
   - Service has many Reviews (1:N)

3. **Booking-Related Entities**:
   - Booking has one Transaction (1:1)
   - Booking has one Review (1:1)

4. **Community-Related Entities**:
   - Discussion has many Comments (1:N)

### Key Relationships:
- User (as Provider) → Service (One user can offer many services)
- User (as Customer) → Booking (One user can make many bookings)
- Service → Booking (One service can have many bookings)
- Booking → Review (One booking can have one review)
- User → Message (Users can send/receive many messages)
- User → Discussion/Comment (Users can create discussions and comments)

## Conclusions

These diagrams provide a comprehensive overview of the Student Marketplace system architecture:

1. The **Use Case Diagram** shows the system's functionality from the users' perspective, identifying different actors and their interactions with the system.

2. The **Data Flow Diagram** illustrates how data moves through the system, showing the processes, data stores, and external entities involved.

3. The **Entity-Relationship Diagram** represents the data model, showing the system's entities, their attributes, and the relationships between them.

Together, these diagrams provide a complete picture of the system's functionality, data flow, and data structure, which will be essential for development and maintenance.