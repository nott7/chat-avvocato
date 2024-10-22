'use client';
/*eslint-disable*/

import Link from '@/components/link/Link';
import MessageBoxChat from '@/components/MessageBox';
import { ChatBody, OpenAIModel } from '@/types/types';
import {
  Button,
  Flex,
  Icon,
  Img,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { MdAutoAwesome, MdBolt, MdEdit, MdPerson } from 'react-icons/md';
import Bg from '../public/img/chat/bg-image.png';
import { v4 as uuidv4 } from 'uuid';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: 'Ciao, come posso aiutarti oggi?',
      user: 'assistant',
    },
  ]);
  const [isNewMessage, setNewMessage] = useState<boolean>(true);
  const socket = useRef<WebSocket | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = uuidv4();

    socket.current = new WebSocket(`wss://ai.michaelsaccone.it/ws/${id}:80`);

    socket.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log('DATA IS ', data.content);

      if (data.type === 'chat_token') {
        const message = data.content;

        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          let msg: any;

          if (lastMessage && lastMessage.user === 'assistant') {
            msg = { ...lastMessage, message: lastMessage.message + message };
            messages[messages.length - 1] = msg;
          } else {
            msg = { message, user: 'assistant' };
            messages = messages.concat(msg);
          }

          return [...messages];
        });
      }

      if (data.type !== 'chat_token') {
        setIsLoading(false);
      }
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.current?.close();
    };
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMessages((prevMessages) => [...prevMessages, { message, user: 'user' }]);
    socket.current?.send(
      JSON.stringify({
        text: message,
      }),
    );
    setMessage('');

    setNewMessage(true);
    setIsLoading(true);
  };

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const iconColor = useColorModeValue('brand.500', 'white');
  const bgIcon = useColorModeValue(
    'linear-gradient(180deg, #FBFBFF 0%, #CACAFF 100%)',
    'whiteAlpha.200',
  );
  const brandColor = useColorModeValue('brand.500', 'white');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.100');
  const gray = useColorModeValue('gray.500', 'white');
  const buttonShadow = useColorModeValue(
    '14px 27px 45px rgba(112, 144, 176, 0.2)',
    'none',
  );
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );

  const handleChange = (Event: any) => {
    setMessage(Event.target.value);
  };

  return (
    <Flex
      w="100%"
      direction="column"
      position="relative"
    >
      <Img
        src={Bg.src}
        position={'absolute'}
        w="350px"
        left="50%"
        top="50%"
        transform={'translate(-50%, -50%)'}
      />
      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        height={{ base: '100vh' }}
        maxW="1000px"
        padding="10px"
        gap="20px"
      >
        {/* Main Box */}
        <Flex
          direction="column"
          gap="10px"
          w="100%"
          mx="auto"
          display="flex"
          overflowY="auto"
          flex={1}
          className='messages-container'
          maxH="100%"
        >
          {messages.map((message, index) =>
            message.user === 'user' ? (
              <Flex key={index} w="100%" align={'center'} mb="10px">
                <Flex
                  borderRadius="full"
                  justify="center"
                  align="center"
                  bg={'transparent'}
                  border="1px solid"
                  borderColor={borderColor}
                  me="20px"
                  h="40px"
                  minH="40px"
                  minW="40px"
                >
                  <Icon
                    as={MdPerson}
                    width="20px"
                    height="20px"
                    color={brandColor}
                  />
                </Flex>
                <Flex
                  p="12px"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="14px"
                  w="100%"
                  zIndex={'2'}
                >
                  <Text
                    color={textColor}
                    fontWeight="600"
                    fontSize={{ base: 'sm', md: 'md' }}
                    lineHeight={{ base: '24px', md: '26px' }}
                  >
                    {message.message}
                  </Text>
                </Flex>
              </Flex>
            ) : (
              <Flex w="100%">
                <Flex
                  borderRadius="full"
                  justify="center"
                  align="center"
                  bg={'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'}
                  me="20px"
                  h="40px"
                  minH="40px"
                  minW="40px"
                >
                  <Icon
                    as={MdAutoAwesome}
                    width="20px"
                    height="20px"
                    color="white"
                  />
                </Flex>
                <MessageBoxChat output={message.message} />
              </Flex>
            ),
          )}
          <div ref={endOfMessagesRef} />
        </Flex>
        {/* Chat Input */}
        <Flex ms={{ base: '0px', xl: '60px' }} mt="auto">
          <Input
            minH="54px"
            h="100%"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: 'none' }}
            color={inputColor}
            _placeholder={placeholderColor}
            placeholder="Scrivi qui il tuo messaggio..."
            onChange={handleChange}
            value={message}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage(e as React.KeyboardEvent<HTMLInputElement>);
              }
            }}
          />
          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            w={{ base: '160px', md: '210px' }}
            h="54px"
            _hover={{
              boxShadow:
                '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
              _disabled: {
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
              },
            }}
            onClick={sendMessage}
            isLoading={isLoading}
          >
            Invia
          </Button>
        </Flex>

        {/* <Flex
          justify="center"
          mt="20px"
          direction={{ base: 'column', md: 'row' }}
          alignItems="center"
        >
          <Text fontSize="xs" textAlign="center" color={gray}>
            Free Research Preview. ChatGPT may produce inaccurate information
            about people, places, or facts.
          </Text>
          <Link href="https://help.openai.com/en/articles/6825453-chatgpt-release-notes">
            <Text
              fontSize="xs"
              color={textColor}
              fontWeight="500"
              textDecoration="underline"
            >
              ChatGPT May 12 Version
            </Text>
          </Link>
        </Flex> */}
      </Flex>
    </Flex>
  );
}
