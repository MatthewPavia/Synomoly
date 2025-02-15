import { useState, useEffect } from 'react'
import './App.css'
import words from '../resources/words.json'
import { Title, Text, TextInput, Container, Space, Box, Stack, Flex, Group, ActionIcon, Modal } from '@mantine/core';
import { IconArrowBigRightFilled } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

function App() {
  const [word, setWord] = useState()
  const [synonyms, setSynonyms] = useState([])
  const [input, setInput] = useState("")
  const [results, setResults] = useState([])
  const [guesses, setGuesses] = useState(0)

  const [opened, { open, close }] = useDisclosure(true);

  const praisePhrases = [
    "Well done!",
    "Nice work!",
    "Great effort!",
    "Excellent work!",
    "Kudos!",
    "Fantastic job!",
    "Bravo!",
    "Keep it up!",
    "Awesome work!",
    "Hats off to you!",
    "Good job!",
    "Thats right!"
  ];

  const errorPhrases = [
    "That's incorrect!",
    "Not quite!",
    "That's wrong!",
    "Try again!",
    "That's off the mark!",
    "Not exactly!",
    "That's a mistake!",
    "Oops, not correct!",
    "That's not quite right!",
  ];

  useEffect(() => getWord(), [])
  useEffect(() => getSynonyms(), [word])
  useEffect(() => setGuesses(determineNumberOfSynonyms()+1), [synonyms])
  useEffect(() => {
    let winningCount = determineNumberOfSynonyms()

    if(results.length === winningCount && winningCount > 0){
      localStorage.setItem("synomoly-"+getDate(), JSON.stringify(results))

      open()
    }
    else if(guesses === 0){

      localStorage.setItem("synomoly-"+getDate(), JSON.stringify(results))

      notifications.show({
        position: 'bottom-right',
        color:'red',
        withCloseButton: true,
        autoClose: 5000,
        message: "You lose!",
      });
    } 
  }, [guesses])

  const getWord = () => {
    let date : string = getDate()
    const foundObject = words.filter(item => item[date as keyof typeof item])[0];
    const word = Object.values(foundObject)[0]
    setWord(word)
  }

  const getDate = () => {

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const utcDate = `${year}-${month}-${day}`;

    return utcDate
  }

  const getSynonyms = () => {

    let headers = new Headers();
    headers.append("X-Api-Key", "Sicb+W4Svaz0NDH8eiEimg==GHiHSZtLpoSNS9A4");

    var requestOptions = {
      method: 'GET',
      headers: headers
    };

    console.log(word)

    if(word){
      fetch("https://api.api-ninjas.com/v1/thesaurus?word="+word, requestOptions)
      //fetch("https://www.dictionaryapi.com/api/v3/references/thesaurus/json/"+word+"?key=76f70900-a565-442e-8e17-5d43e5a3bda0")
      .then(x => x.json())
      .then(y => {console.log(y); setSynonyms(y.synonyms)})
    }
  }

  const determineNumberOfSynonyms = () => {
    const length = synonyms.length
    
    if(length <= 2){
      return length
    }
    else if(length <= 5){
      return length -1
    }
    else if(length <= 10){
      return length
    }
    else if(length <= 20){
      return Math.floor(length/2)
    }
    else{
      return 10
    }
  }

  const renderForms = () => {
    let forms = []
    let numToRender = determineNumberOfSynonyms()

    for (let i = 0; i < numToRender; i++) {
      forms.push(results[i] ? 
        <Text style={{color:"white"}} size="xl">{capitalizeFirstLetter(results[i])}</Text> 
        : 
        <Box
          style={{
            backgroundColor:"gray",
            width:"30rem",
            height:"2rem",
            borderRadius:"7px"
        }}
      />)
    }

    return forms
  }

  const capitalizeFirstLetter = (val:string) => {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  const submitWord = () => {
    if(!input){
      return
    }

    let alreadyAnswered = results.find(x => x == input.toLowerCase())

    if(alreadyAnswered){
      notifications.show({
        position: 'bottom-right',
        color:'yellow',
        withCloseButton: true,
        autoClose: 5000,
        message: "You've already said that 🤨",
      });
      
      return
    }

    setGuesses(guesses-1)

    let result = synonyms.find(x => x == input.toLowerCase())

    if(result){
      setResults(results => [...results, result] );

      notifications.show({
        position: 'bottom-right',
        color:'green',
        withCloseButton: true,
        autoClose: 5000,
        message: pickRandom(praisePhrases),
      });

      setInput("")
    }
    else{
      notifications.show({
        position: 'bottom-right',
        color:'red',
        withCloseButton: true,
        autoClose: 5000,
        message: pickRandom(errorPhrases),
      });
    }
  }

  const pickRandom = (array : Array<string>) => {
    var randomAnswer = array[Math.floor(Math.random() * array.length)];

    return randomAnswer
  }

  return (
    <>
      <Modal color="red" opened={opened} onClose={close} title="Congratulations!" centered>
        {/* Modal content */}
      </Modal>

      <Flex gap={"lg"} style={{backgroundColor:"#242424"}} align={"center"} direction={"column"}>
        <Stack
          align="stretch"
          justify="center"
          gap="xs"
          p={"20px"}
        >
          <Title style={{color:"white", fontSize:"60px"}} order={1}>Synomoly</Title>
          <Text style={{color:"white"}} size="lg">The daily synonym game</Text>
        </Stack>

        <Stack
          align="stretch"
          justify="center"
          gap="xs"
        >
          <Text style={{color:"white"}} size="xs">Find {determineNumberOfSynonyms()} synonyms for the word</Text>
          <Title style={{color:"white"}} order={1}>{capitalizeFirstLetter(word ?? "")}</Title>
        </Stack>

        <Stack
          align="stretch"
          justify="center"
          gap="xs"
          p="10px"
        >
          {renderForms()}
          <Text p={"1rem"} size="sm" style={{color:"white"}}>Guesses left: {guesses}</Text>
        </Stack>
        <Space h="md" />
        {
          <Group>
            <TextInput onKeyDown={event => { if (event.key === 'Enter') { submitWord() } }} value={input} id="input" onChange={e => setInput(e.target.value)} placeholder="Write a synonym" size="lg" />
            <ActionIcon onClick={submitWord} size="lg" variant="default" aria-label="ActionIcon the same size as inputs">
              <IconArrowBigRightFilled/>
            </ActionIcon>
          </Group>
        }
      </Flex>    
    </>
  )
}

export default App
