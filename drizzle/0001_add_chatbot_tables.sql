-- Add chatbot tables
CREATE TABLE `chatbots` (
  `id` int AUTO_INCREMENT NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `config` json,
  `script_config` json,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `chatbots_id` PRIMARY KEY(`id`)
);

CREATE TABLE `documents` (
  `id` int AUTO_INCREMENT NOT NULL,
  `chatbot_id` int NOT NULL,
  `url` text,
  `content` text,
  `content_type` varchar(50),
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);

CREATE TABLE `vectors` (
  `id` int AUTO_INCREMENT NOT NULL,
  `document_id` int NOT NULL,
  `content` text,
  `embedding` json,
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `vectors_id` PRIMARY KEY(`id`)
);

CREATE TABLE `chat_history` (
  `id` int AUTO_INCREMENT NOT NULL,
  `chatbot_id` int NOT NULL,
  `session_id` varchar(255),
  `role` varchar(20) NOT NULL,
  `content` text,
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `chat_history_id` PRIMARY KEY(`id`)
);

-- Add foreign key constraints
ALTER TABLE `chatbots` ADD CONSTRAINT `chatbots_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `documents` ADD CONSTRAINT `documents_chatbot_id_chatbots_id_fk` FOREIGN KEY (`chatbot_id`) REFERENCES `chatbots`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `vectors` ADD CONSTRAINT `vectors_document_id_documents_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `chat_history` ADD CONSTRAINT `chat_history_chatbot_id_chatbots_id_fk` FOREIGN KEY (`chatbot_id`) REFERENCES `chatbots`(`id`) ON DELETE no action ON UPDATE no action;