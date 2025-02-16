import { useState, useEffect } from 'react'
import './App.css'
import words from '../resources/words.json'
import { Title, Text, TextInput, Space, Box, Stack, Flex, Group, ActionIcon, Button } from '@mantine/core';
import { IconArrowBigRightFilled } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import ResultsModal from './components/ResultsModal';
import PageTitle from './components/PageTitle';
import { capitalizeFirstLetter } from './utils/StringUtils';

function App() {
  const [word, setWord] = useState("")
  const [synonyms, setSynonyms] = useState([])
  const [input, setInput] = useState("")
  const [results, setResults] = useState([])
  const [guesses, setGuesses] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)

  const [opened, { open, close }] = useDisclosure(false);

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

  useEffect(() => {
    getWord()
    let cache = getTodayCache()
    if(cache){
      let results = JSON.parse(cache)
      setResults(results)
      open()
    }
  }, [])
  useEffect(() => getSynonyms(), [word])
  useEffect(() => { 
    if(isTodayComplete()){
      setGuesses(0) 
    }
    else{
      setGuesses(determineNumberOfSynonyms()+1) 
    }
  }, [synonyms])
  useEffect(() => {
    let winningCount = determineNumberOfSynonyms()

    if(results.length === winningCount && winningCount > 0){
      localStorage.setItem("synomoly-"+getDate(), JSON.stringify(results))

      open()
    }
    else if(guesses === 0 && hasAnswered){
      localStorage.setItem("synomoly-"+getDate(), JSON.stringify(results))
      
      open()
    } 
  }, [guesses])

  const getTodayCache = () => {
    let cache = localStorage.getItem("synomoly-"+getDate())
    return cache
  }

  const isTodayComplete = () => {
    return getTodayCache() ? true : false
  }

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

    if(word){
      //fetch("https://api.api-ninjas.com/v1/thesaurus?word="+word, requestOptions)
      fetch("https://www.dictionaryapi.com/api/v3/references/thesaurus/json/"+word+"?key=76f70900-a565-442e-8e17-5d43e5a3bda0")
      .then(x => x.json())
      .then(y => {console.log(y[0].meta.syns.flat());setSynonyms(y[0].meta.syns.flat())})
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

    setHasAnswered(true)
  }

  const giveUp = () => {
    localStorage.setItem("synomoly-"+getDate(), JSON.stringify(results))
    open()
  }

  const pickRandom = (array : Array<string>) => {
    var randomAnswer = array[Math.floor(Math.random() * array.length)];

    return randomAnswer
  }

  return (
    <>
      <ResultsModal
        isOpen={opened}
        onClose={close}
        date={getDate()}
        score={results.length}
        expectedResult={determineNumberOfSynonyms()}
        possibleAnswers={synonyms.length}
        possibleSynonyms={synonyms}
      />

      <Flex gap={"lg"} style={{backgroundColor:"#242424"}} align={"center"} direction={"column"}>
        
        <PageTitle/>

        <Stack
          align="stretch"
          justify="center"
          gap="xs"
        >
          <Text style={{color:"white"}} size="xs">Find {determineNumberOfSynonyms()} synonyms for the word</Text>
          <Title td="underline" style={{color:"white"}} order={1}>{capitalizeFirstLetter(word ?? "")}</Title>
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
        <Stack>
          <Group>
            <TextInput disabled={guesses<1} onKeyDown={event => { if (event.key === 'Enter') { submitWord() } }} value={input} id="input" onChange={e => setInput(e.target.value)} placeholder="Write a synonym" size="lg" />
            <ActionIcon disabled={guesses<1} onClick={submitWord} size="lg" variant="default">
              <IconArrowBigRightFilled/>
            </ActionIcon>
          </Group>
          <Button onClick={giveUp} color='white' variant="subtle">Give up?</Button>
        </Stack>
      </Flex>    
    </>
  )
}

export default App
