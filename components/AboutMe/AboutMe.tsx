import styled from '@emotion/styled';

import Heading from '../Common/Heading';

const AboutMeStyled = styled.div`
  margin-top: 60px;
`;

const Content = styled.div``;

const AboutMe: React.FC = () => {
  return (
    <AboutMeStyled id="about_me">
      <Heading href="#about_me">About Me</Heading>
      <Content>
        Hey! I am Arpit, a fullstack software engineer destined for greatness. I focus primarily on
        using Javascript on the frontend and backend. I am currently working remotely, solving
        problems and shipping new features to clients. In my free time you will find me making 3D
        art or binging YouTube and Netflix while listening to some lo-fi hip/hop.
      </Content>
    </AboutMeStyled>
  );
};

export default AboutMe;
