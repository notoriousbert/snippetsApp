import React, { useEffect, useState, useRef } from "react";
import { LinkContainer } from "react-router-bootstrap";
import { Navbar, Nav, Button, Figure } from "react-bootstrap";
import { useProvideAuth } from "hooks/useAuth";
import axios from "utils/axiosConfig.js";

export default function Header({ currentUserFromApp, profilePicFromApp }) {
  const {
    state: { user },
    signout,
  } = useProvideAuth();

  if (!user) {
    return null;
  }
  return (
    <Navbar bg="header" expand="lg">
      <Navbar.Brand style={{ marginLeft: "50px" }}>
        <LinkContainer to={"/"}>
          <Nav.Link>
            <img src="/logo.png" alt="logo" width="180px" />
          </Nav.Link>
        </LinkContainer>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        {user && (
          <>
            <Nav className="ml-auto mr-2">
              <LinkContainer
                className="d-flex align-items-end"
                to={`/u/${user.username}`}
              >
                <Nav.Link>
                  <Figure
                    className="bg-border-color rounded-circle overflow-hidden my-auto ml-2 p-1"
                    style={{
                      height: "35px",
                      width: "35px",
                      background: "transparent",
                    }}
                  >
                    <Figure.Image
                      // onClick={}
                      src={profilePicFromApp}
                      className="w-100 h-100 rounded-circle"
                    />
                  </Figure>
                </Nav.Link>
              </LinkContainer>
              {/* <LinkContainer
                className='d-flex align-items-center'
                to={`/u/${user.username}`}
              >
                <Nav.Link>{user.username}</Nav.Link>
              </LinkContainer> */}
            </Nav>
            <Button
              variant="outline-info"
              onClick={() => signout()}
              style={{ border: "none", marginRight: "50px", color: "#E5E1DF" }}
            >
              Sign Out
            </Button>
          </>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}
