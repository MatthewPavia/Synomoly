import { useState, useEffect } from 'react'
import './App.css'
import words from '../resources/words.json'
import { Title, Text, TextInput, Space, Box, Stack, Flex, Group, ActionIcon, Button, Affix } from '@mantine/core';
import { IconArrowBigRightFilled, IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import ResultsModal from './components/ResultsModal';
import PageTitle from './components/PageTitle';
import { capitalizeFirstLetter } from './utils/StringUtils';
import { errorPhrases, praisePhrases } from './utils/Phrases';
import SimpleModal from './components/SimpleModal';
import { generate } from "random-words";

function App() {
  const [word, setWord] = useState("")
  const [synonyms, setSynonyms] = useState([])
  const [input, setInput] = useState("")
  const [results, setResults] = useState([])
  const [guesses, setGuesses] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)

  const [resultOpened, { open:openResult, close:CloseResult }] = useDisclosure(false);
  const [infoOpened, { toggle:toggleInfo }] = useDisclosure(false);

  useEffect(() => {
    getWord()
    let cache = getTodayCache()
    if(cache){
      let results = JSON.parse(cache)
      setResults(results)
      openResult()
    }
  }, [])
  useEffect(() => getSynonyms(), [word])
  useEffect(() => { 
    if(isTodayComplete()){
      setGuesses(0) 
    }
    else{
      let numOfSynonyms = determineNumberOfSynonyms()
      setGuesses(numOfSynonyms+Math.floor((numOfSynonyms/1.5))) 
    }
  }, [synonyms])
  useEffect(() => {
    let winningCount = determineNumberOfSynonyms()

    if(results.length === winningCount && winningCount > 0){
      localStorage.setItem("synomoly-"+getDate(), JSON.stringify(results))

      openResult()
    }
    else if(guesses === 0 && hasAnswered){
      localStorage.setItem("synomoly-"+getDate(), JSON.stringify(results))
      
      openResult()
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
    let word:string = ""
    let date:string = getDate()
    const foundObject = words.filter(item => item[date as keyof typeof item])[0];
    if(foundObject){
      word = Object.values(foundObject)[0]
    }
    else{
      word = generate() as string
    }
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
      return length/2
    }
    else{
      return 5
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
          w={{ xs: "10rem", sm: "15rem", md:"30rem", lg: "30rem" }}
          style={{
            backgroundColor:"gray",
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
    openResult()
  }

  const pickRandom = (array : Array<string>) => {
    var randomAnswer = array[Math.floor(Math.random() * array.length)];

    return randomAnswer
  }

  return (
    <>
      <ResultsModal
        isOpen={resultOpened}
        onClose={CloseResult}
        date={getDate()}
        score={results.length}
        expectedResult={determineNumberOfSynonyms()}
        possibleAnswers={synonyms.length}
        possibleSynonyms={synonyms}
      />

      <SimpleModal
        isOpen={infoOpened}
        onClose={toggleInfo}
      >
        <Stack>
          <Title order={2}>About Synomoly 📖</Title>
          <Text style={{color:"white"}}>Synomoly is a daily game meant to test your English language knowledge!</Text>
          <Text style={{color:"white"}}>All synonyms provided by Merriam-Webster's Collegiate® Dictionary</Text>

          <Title order={4}>Think outside the box!</Title>
          <Text style={{color:"white"}}>Choose synonyms for all definitions of a word. For example, "Slow" can mean "sluggish" but also mean slow as in "dumb".</Text>
        </Stack>
      </SimpleModal>

      <Affix position={{ top: 20, right: 60 }}>
        <ActionIcon onClick={toggleInfo} color='white' size="xl" variant='subtle'>
          <IconInfoCircle/>
        </ActionIcon>
      </Affix>
      
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
          <Text p={"1rem"} size="sm" style={{color:"white"}}>Guesses left: {isTodayComplete() ? 0 : guesses}</Text>
        </Stack>
        <Space h="md" />
        <Stack>
          <Group>
            <TextInput disabled={guesses<1 || isTodayComplete()} onKeyDown={event => { if (event.key === 'Enter') { submitWord() } }} value={input} id="input" onChange={e => setInput(e.target.value)} placeholder="Write a synonym" size="lg" />
            <ActionIcon disabled={guesses<1 || isTodayComplete()} onClick={submitWord} size="lg" variant="default">
              <IconArrowBigRightFilled/>
            </ActionIcon>
          </Group>
          <Button  onClick={giveUp} color='white' variant="subtle">{isTodayComplete() ? "Result" : "Give up?"}</Button>
        </Stack>
      </Flex>    
    </>
  )
}

export default App
