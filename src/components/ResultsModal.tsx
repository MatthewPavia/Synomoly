import { Modal, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { capitalizeFirstLetter } from "../utils/StringUtils";

interface ResultsModalProps{
    isOpen:boolean;
    onClose: () => void;
    date:string;
    score:number;
    expectedResult:number;
    possibleAnswers:number;
    possibleSynonyms:string[]
}

function ResultsModal(props:ResultsModalProps) {

    const getStreak = () => {
        let storage = JSON.parse(JSON.stringify(localStorage)) as object
        let keys = Object.keys(storage).filter(x => x.includes("synomoly-"))

        let dates = keys.map(x => x.replace("synomoly-",""))

        let streak = longestConsecutiveStreak(dates)

        return streak
    }

    function longestConsecutiveStreak(dates:string[]) {
        let sortedDates = dates.map(date => new Date(date)).sort((a, b) => a.getTime() - b.getTime());
    
        let longestStreak = 1;
        let currentStreak = 1;
    
        for (let i = 1; i < sortedDates.length; i++) {
            const diff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    
            if (diff === 1) {
                currentStreak++;
            } else if (diff > 1) {
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 1;
            }
        }
    
        return Math.max(longestStreak, currentStreak);
    }
    

    return (
        <Modal 
            color="red" 
            opened={props.isOpen} 
            onClose={() => props.onClose()}
            withCloseButton={false}
            centered 
            styles={{
                content: { backgroundColor: '#242424', color: 'white' }
            }}
        >
            <Stack>
                <Text style={{color:"white"}} size="md">⏰ Come back to play again tomorrow! ⏰</Text>
                <Title style={{color:"white"}} order={6}>Current Streak 🔥: {getStreak()}</Title>
                <Title style={{color:"white"}} order={1}>Game Summary</Title>
                <Title style={{color:"white"}} order={6}>({props.date})</Title>
                <Text style={{color:"white"}} size="md">Your score: {props.score}/{props.expectedResult}</Text>
                <Text fw={600} style={{color:"white"}} size="md">{props.possibleAnswers} possible answers</Text>
                <ScrollArea h={250}>
                        {props.possibleSynonyms.map(x => <Text style={{color:"white"}}>{capitalizeFirstLetter(x)}</Text>)}
                </ScrollArea>
            </Stack>
        </Modal>
    )
}

export default ResultsModal
