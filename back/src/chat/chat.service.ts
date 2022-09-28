import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageDto } from './channel/dto/message.dto';

// @Injectable()
// export class ChatService {
//   constructor(
//     @InjectRepository(Message)
//     messageRepo: Message,
//     @InjectRepository(Channel)
//     channelRepo: Channel,
//   ) {}

//   messages: MessageDto[] = [{ sender: 'jojo', content: 'hello ?' }];
//   clientToUser = {}

//   create(createMessageDto: MessageDto, clientId: string) {
//     const message = {
//       sender: this.clientToUser[clientId],
//       content: createMessageDto.content,
//     };
//     this.messages.push(createMessageDto);

//     return message;
//   }

//   findAll() {
//     return this.messages;
//   }

//   joinChannel(name: string, clientId: string) {
    
//   }

//   getClientName(clientId: string) {
//     return this.clientToUser[clientId];
//   }
// }
