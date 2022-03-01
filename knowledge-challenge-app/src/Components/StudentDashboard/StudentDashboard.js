import "bootstrap/dist/css/bootstrap.min.css";
import "./StudentDashboard.css";
import React, { useEffect, useState } from "react";
import Network from "../Networking";
import Header from "../Header";
import LO from "../LO/LO";
import Button from "react-bootstrap/esm/Button";
import Nav from "react-bootstrap/Nav";
import ProgressBar from "react-bootstrap/ProgressBar";
import Card from "react-bootstrap/Card";

function StudentDashboard(props) {
  const [data, setData] = useState([]);
  const [topics, setTopics] = useState([]);
  const [numberOfLOs, setNumberOfLOs] = useState(0);
  const [numberOfClickedLOs, setNumberOfClickedLOs] = useState(0);

  const network = new Network();

  // console.log(document.querySelectorAll(" p * div "));

  function updateProgress(direction) {
    let updatedNumber = numberOfClickedLOs;
    if (LO.isActive) {
      if (direction === "increase") {
        updatedNumber += 1;
      } else {
        updatedNumber -= 1;
      }
    }
    setNumberOfClickedLOs(updatedNumber);
  }

  document.title = `${props.cookies.email.split("@")[0]}'s Knowledge Checklist`;

  useEffect(() => {
    (async () => {
      const firstLoadData = await updateScore();
      console.log(firstLoadData);
      setNumberOfLOs(firstLoadData.length);

      const ClickedLOs = firstLoadData.filter((objects) => objects.score !== 1);
      setNumberOfClickedLOs(ClickedLOs.length);

      const uniqueTopics = await network.getAllTopicsOnlyPerStudent(
        props.cookies.userID
      );
      setTopics(uniqueTopics);
    })();
  }, []);

  async function updateScore() {
    const data = await network.getAllTopicsPerStudent(props.cookies.userID);
    console.log(data);
    setData(data);
    return data;
  }

  function getWelcomeMessage(id) {
    return (
      <div id="welcome">
        <Card className="m-3" style={{ width: "80rem" }}>
          <Card.Header style={{ fontSize: 20 }}>
            <strong>
              Welcome, {id}! <br /> How to use this checklist:
            </strong>
          </Card.Header>
          <Card.Body>
            <Card.Title></Card.Title>
            <Card.Text>
              Select your level of confidence with the buttons next to each
              statement. Choosing <span className="red">'not confident'</span>{" "}
              will colour the statement red. Choosing{" "}
              <span className="yellow">'needs revision'</span> will colour the
              statement yellow. Finally, choosing{" "}
              <span className="green">'feel confident'</span> will colour the
              statement green. Essentially:
              <ul>
                <li>
                  <strong>
                    <span className="red">Red</span>
                  </strong>{" "}
                  topics are those you don't understand well.
                </li>
                <li>
                  <strong>
                    <span className="yellow">Yellow</span>
                  </strong>{" "}
                  topics are those that still need work.{" "}
                </li>
                <li>
                  <strong>
                    <span className="green">Green</span>
                  </strong>{" "}
                  topics are the ones you feel most confident with.
                </li>
              </ul>{" "}
              At the bottom of the page, there is a button to print / save your
              progress. This will allow you to save a PDF or print a version of
              the page with the selections you have made. Additionally, you may
              prefer landscape orientation to portrait for ease of reading.
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    );
  }

  function createTopics(data) {
    if (!data) {
      return <h3>Loading.. </h3>;
    }

    const topicCards = topics.map((item) => {
      return (
        <Card id={`${item.topic}`} className={`m-3 ${item.topic}`}>
          <Card.Header>
            <strong>{item.topic}</strong>
          </Card.Header>
          <Card.Body>
            <Card.Text>
              {data ? createLOs(data, item.topic) : getLoadingComponent()}
            </Card.Text>
          </Card.Body>
        </Card>
      );
    });
    return topicCards;
  }

  function createLOs(data, topic) {
    const filteredLOs = data.filter((topicList) => topicList.topic === topic);
    const topicData = filteredLOs.map((topic) => {
      return (
        <LO
          key={topic.id}
          learningObjective={topic.learning_objective}
          score={topic.score}
          userID={props.cookies.userID}
          updateProgress={(direction) => updateProgress(direction)}
          updateScore={(newData) => updateScore(newData)}
          isActive={topic.isActive}
        />
      );
    });

    return topicData;
  }

  function getLoadingComponent() {
    return <div className="loader" />;
  }

  function getSideNavBar(topicList) {
    return (
      <div className="sidenav">
        <>
          <style type="text/css">
            {`
                    .nav-navbar {
                      background-color: white;
                      margin-top: 15px;
                    }
                    a:link {
                      color: #e6530f;
                      background-color: transparent;
                      text-decoration: none;
                    }
                    a:active {
                      color: #e6530f;
                      background-color: transparent;
                      text-decoration: underline;
                    }
                    a:hover {
                      color: #e6530f;
                      background-color: transparent;
                      text-decoration: underline;
                    }
                    a:visited {
                      color: #e6530f;
                      background-color: transparent;
                      text-decoration: none;
                    }
                    `}
          </style>
          <Nav
            onSelect={(eventKey) => {
              document
                .getElementById(eventKey)
                .scrollIntoView({ behavior: "smooth" });
            }}
            fill
            variant="navbar"
            className="flex-column"
          >
            <Nav.Link href="#welcome" eventKey="welcome">
              Welcome
            </Nav.Link>
            {topicList.map((item) => {
              return (
                <Nav.Link href={`#${item.topic}`} eventKey={`${item.topic}`}>
                  {item.topic}
                </Nav.Link>
              );
            })}
          </Nav>
        </>
      </div>
    );
  }

  function getProgressBar(numberOfClickedLOs, numberOfLOs) {
    return (
      <ProgressBar
        display
        striped
        variant="warning"
        animated
        now={Math.round((numberOfClickedLOs / numberOfLOs) * 100)}
        label={Math.round((numberOfClickedLOs / numberOfLOs) * 100) + `%`}
      />
    );
  }

  return (
    <>
      <Header cook={props.cookies.email} logOut={props.logOut} />
      <div className="checklist-page">
        {getProgressBar(numberOfClickedLOs, numberOfLOs)}

        <div className="main-content">
          {topics ? getSideNavBar(topics) : getLoadingComponent()}

          <div className="bulk-content">
            {getWelcomeMessage(props.cookies.email.split("@")[0])}

            <div className="topics">
              {data ? createTopics(data) : getLoadingComponent()}
            </div>

            <div className="export-pdf-button">
              <>
                <style type="text/css">
                  {`
                    .btn-pdf {
                      background-color: #d14420;
                      color: white;
                      margin-top: 30px;
                      margin-bottom: 30px;  
                    }
                    `}
                </style>
                <Button className="export-pdf-button" variant="pdf">
                  Save to PDF
                </Button>
              </>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default StudentDashboard;
