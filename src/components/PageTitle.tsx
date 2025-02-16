import { Stack, Text, Title } from "@mantine/core";

function PageTitle() {
    return (
        <Stack
          align="stretch"
          justify="center"
          gap="xs"
          p={"20px"}
        >
          <Title style={{color:"white", fontSize:"60px"}} order={1}>Synomoly</Title>
          <Text style={{color:"white"}} size="lg">The daily synonym game</Text>
        </Stack>
    )
}

export default PageTitle
