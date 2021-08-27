import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Media,
  Figure,
  ListGroup,
  Modal,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import useRouter from "hooks/useRouter";
import { useProvideAuth } from "hooks/useAuth";
import axios from "utils/axiosConfig.js";
import { timeSince } from "utils/timeSince";
import { LikeIcon, LikeIconFill, ReplyIcon, TrashIcon } from "components";
import "./Post.scss";
import { toast } from "react-toastify";

const initialState = {
  commentText: "",
  isSubmitting: false,
  errorMessage: null,
};

export default function Post({
  post: { _id, author, profile_image, text, comments, created, likes },
  detail,
  userDetail,
  getPosts,
  getPostDetailPost,
  userFromDetailPage,
  profilePicFromApp,
}) {

  const likesInStringForm = likes.map((like) => like['_id'].toString())
  const [data, setData] = useState(initialState);
  const [validated, setValidated] = useState(false);
  const [stateComments, setStateComments] = useState(comments);
  const router = useRouter();

  const {
    state: { user },
  } = useProvideAuth();

  const [stateLikes, setStateLikes] = useState(likes);
  const [likedState, setLiked] = useState(likesInStringForm.includes(user.uid));
  const [likesState, setLikes] = useState(likes.length);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  const handleInputChange = (event) => {
    setData({
      ...data,
      [event.target.name]: event.target.value,
    });
  };

  const handleToggleLike = async () => {
    // console.log(likes)
    if (!likedState) {
      setLiked(true);
      setLikes(likesState + 1);
      try {
        await axios.post(`posts/like/${_id}`)
        getPosts();
        getPostDetailPost()
        setStateLikes(likes);
      } catch (error) {
        console.log(error);
        return error;
      }
    } else {
      setLiked(false);
      setLikes(likesState - 1);
      try {
        await axios.post(`posts/like/${_id}`);
        getPosts();
        getPostDetailPost()
        setStateLikes(likes);
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  };

  // Complete function to call server endpoint /posts/:id
  // with delete request
  const handleDeletePost = async () => {
    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });
    console.log("Delete post", _id);
    await axios.delete(`/posts/${_id}`);
    setData(initialState);
    getPosts();
    handleCloseDeleteModal();
    toast("Your post has been deleted.");
  };

  const handleCommentSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === false) {
      toast.error("Comment text is required");
      setValidated(true);
      return;
    }

    setData({
      ...data,
      isSubmitting: true,
      errorMessage: null,
    });

    axios
      .put("/posts/comments", {
        text: data.commentText,
        userId: user.uid,
        postId: _id,
      })
      .then(
        ({ data }) => {
          setData(initialState);
          setStateComments(data.comments);
          setValidated(false);
        },
        (error) => {
          console.log("axios error", error);
        }
      );
  };

  useEffect(() => {
    setStateComments(comments);
    setStateLikes(likes);
  }, [comments, likes]);

  const renderNamesForLikesTooltip = (props) => {
    let listOfUserNames = ``;

    stateLikes.forEach((uniqueLike, index) => {
      if (index + 1 === stateLikes.length) {
        listOfUserNames += uniqueLike.username;
      } else {
        listOfUserNames += `${uniqueLike.username}, `;
      }
    });

    return (
      <Tooltip id="button-tooltip" {...props}>
        {listOfUserNames.length > 0 ? listOfUserNames : "No likes yet"}
      </Tooltip>
    );
  };

  return (
    <>
      <ListGroup.Item
        className="bg-white text-danger px-3 rounded-edge"
        as={"div"}
        key={_id}
      >
        <Media className="mb-n2 w-100">
          <Link to={`/u/${author.username}`}>
            <Figure
              className="mr-4 rounded thumbnail ml-2 p-1"
              style={{ height: "55px", width: "55px", marginTop: "0px" }}
            >
              <Figure.Image
                src={
                  profilePicFromApp ? profilePicFromApp : author.profile_image
                }
                className="w-95 h-95 rounded"
              />
            </Figure>
          </Link>
          <Media.Body className="w-50">
            <div className="row d-flex align-items-center">
              <span className="text-muted mr-1 username">
                <Link to={`/u/${author.username}`}>@{author.username}</Link>
              </span>
              <pre className="m-0 text-muted">{" - "}</pre>
              <span className="text-muted">{timeSince(created)} ago</span>
            </div>
            <div className="row mb-n1 mt-1 position-relative">
              <blockquote className="mb-1 mw-100">
                <div className="mw-100 overflow-hidden">{text}</div>
              </blockquote>
            </div>

            <div className="row justify-content-end align-items-center">
              <div className="d-flex align-items-center">
                {user.username === author.username && (
                  <Container className="close">
                    <TrashIcon onClick={handleShowDeleteModal} />
                  </Container>
                )}
              </div>

              <div className="d-flex align-items-center mr-2">
                <Button
                  variant="link"
                  size="md"
                  onClick={() => router.push(`/p/${_id}`)}
                >
                  <ReplyIcon />
                </Button>
                <span>{comments.length > 0 ? comments.length : 0}</span>
              </div>
              <div
                className={`d-flex align-items-center mr-3 ${
                  likedState ? "isLiked" : ""
                }`}
              >
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderNamesForLikesTooltip}
                >
                  <Button variant="link" size="md" onClick={handleToggleLike}>
                    {likedState ? <LikeIconFill /> : <LikeIcon />}
                  </Button>
                </OverlayTrigger>
                <span>{likesState}</span>
              </div>

              <Modal
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                animation={false}
              >
                <Modal.Header closeButton className="modal-header">
                  <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                  Are you sure you want to delete this post?
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseDeleteModal}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleDeletePost}>
                    Delete
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </Media.Body>
        </Media>
      </ListGroup.Item>
      {detail && (
        <div>
          <br />
          <Form
            noValidate
            validated={validated}
            onSubmit={handleCommentSubmit}
            className="clearfix"
          >
            <Form.Control
              type="text"
              size="md"
              name="commentText"
              maxLength="120"
              placeholder="Reply"
              aria-describedby="comment-input"
              required
              value={data.commentText}
              onChange={handleInputChange}
            />
            <Button className="float-right mt-3" type="submit">
              Comment
            </Button>
            <Form.Control.Feedback type="invalid" className="text-warning">
              Comment text is required
            </Form.Control.Feedback>

            {data.errorMessage && (
              <span className="form-error">{data.errorMessage}</span>
            )}
          </Form>
          {!stateComments.length > 0 ? (
            <div>no comments</div>
          ) : (
            <Container>
              {stateComments.map((c, index) => (
                <div
                  className="row my-3 align-items-center"
                  key={index}
                  style={{ flexWrap: "nowrap" }}
                >
                  <Figure
                    className="mr-4 bg-white rounded-circle overflow-hidden my-auto ml-2"
                    style={{
                      height: "40px",
                      flexBasis: "40px",
                      minWidth: "40px",
                    }}
                  >
                    <Figure.Image
                      src={c.author?.profile_image}
                      style={{ height: "40px", width: "40px" }}
                    />
                  </Figure>
                  <span>{timeSince(c.created)} ago {c.text}</span>
                </div>
              ))}
            </Container>
          )}
        </div>
      )}
    </>
  );
}
