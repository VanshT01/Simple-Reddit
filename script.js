// Mock Data
let users = {}; // { username: { subscribedSubreddits, totalUpvotes, upvotedPosts } }
let currentUser = null; // Currently logged-in user
let subreddits = ["Technology", "Gaming", "Movies"];
const posts = []; // { title, content, subreddit, author, votes, upvoters, comments }

// Initialize the App
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-button").addEventListener("click", logIn);
  document.getElementById("signup-button").addEventListener("click", signUp);
  document.getElementById("profile-button").addEventListener("click", showProfile);
  document.getElementById("create-subreddit-button").addEventListener("click", createSubreddit);

  document.getElementById("post-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) return alert("Please log in to create a post.");
    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;
    createPost(title, content);
    document.getElementById("post-form").reset();
  });

  document.getElementById("subscribe-button").addEventListener("click", toggleSubscription);

  loadWelcomeScreen();
  loadSubreddits();
});

// Log in an existing user
function logIn() {
  const username = prompt("Enter your username:");
  if (users[username]) {
    currentUser = username;
    loadWelcomeScreen();
    alert(`Logged in as ${username}`);
  } else {
    alert("User does not exist. Please sign up.");
  }
}

// Sign up a new user
function signUp() {
  const username = prompt("Choose a username:");
  if (users[username]) {
    alert("Username already taken. Please choose another.");
  } else {
    users[username] = { subscribedSubreddits: [], totalUpvotes: 0, upvotedPosts: new Set() };
    currentUser = username;
    loadWelcomeScreen();
    alert(`Account created for ${username}`);
  }
}

// Create a new subreddit
function createSubreddit() {
  if (!currentUser) return alert("Please log in to create a subreddit.");
  const subreddit = prompt("Enter subreddit name:");
  if (!subreddit || subreddits.includes(subreddit)) {
    alert("Subreddit already exists or invalid name.");
    return;
  }
  subreddits.push(subreddit);
  loadSubreddits();
  alert(`Subreddit '${subreddit}' created!`);
}

// Load the welcome screen
function loadWelcomeScreen() {
  document.getElementById("welcome-section").style.display = "block";
  document.getElementById("post-section").style.display = "none";
  document.getElementById("profile-section").style.display = "none";
  document.getElementById("sidebar").style.display = currentUser ? "block" : "none";
}

// Load subreddits into the sidebar
function loadSubreddits() {
  const subredditList = document.getElementById("subreddit-list");
  subredditList.innerHTML = "";
  subreddits.forEach((sub) => {
    const button = document.createElement("button");
    button.textContent = sub;
    button.onclick = () => selectSubreddit(sub);
    subredditList.appendChild(button);
  });
}

// Select a subreddit
function selectSubreddit(subreddit) {
  document.getElementById("welcome-section").style.display = "none";
  document.getElementById("post-section").style.display = "block";
  document.getElementById("profile-section").style.display = "none";
  document.getElementById("subreddit-title").textContent = `Posts in ${subreddit}`;

  // Update the Subscribe button based on user subscription
  const subscribeButton = document.getElementById("subscribe-button");
  subscribeButton.style.display = currentUser ? "block" : "none";
  const user = users[currentUser];
  if (user.subscribedSubreddits.includes(subreddit)) {
    subscribeButton.textContent = "Unsubscribe";
  } else {
    subscribeButton.textContent = "Subscribe";
  }

  loadPosts(subreddit);
}

// Toggle subreddit subscription
function toggleSubscription() {
  const subreddit = document.getElementById("subreddit-title").textContent.replace("Posts in ", "");
  const user = users[currentUser];
  if (user.subscribedSubreddits.includes(subreddit)) {
    user.subscribedSubreddits = user.subscribedSubreddits.filter((sub) => sub !== subreddit);
    document.getElementById("subscribe-button").textContent = "Subscribe";
  } else {
    user.subscribedSubreddits.push(subreddit);
    document.getElementById("subscribe-button").textContent = "Unsubscribe";
  }
  showProfile();
}

// Create a new post
function createPost(title, content) {
  const subreddit = document.getElementById("subreddit-title").textContent.replace("Posts in ", "");
  posts.push({ title, content, subreddit, author: currentUser, votes: 0, upvoters: [], comments: [] });
  loadPosts(subreddit);
}

// Load posts for a subreddit
function loadPosts(subreddit) {
  const postsContainer = document.getElementById("posts-container");
  const filteredPosts = posts.filter((post) => post.subreddit === subreddit);
  postsContainer.innerHTML = filteredPosts
    .map(
      (post) => `
    <div class="post">
      <div class="post-title">${post.title}</div>
      <p>${post.content}</p>
      <p>By <a href="#" onclick="viewProfile('${post.author}')">${post.author}</a></p>
      <div>
        <span class="vote-btn" onclick="upvote('${post.title}')">⬆️ Upvote</span>
        <span>${post.votes} votes</span>
      </div>
      <div class="comment-section">
        <input type="text" class="comment-input" placeholder="Write a comment..." onkeypress="addComment(event, '${post.title}')">
        <div>${post.comments.map((comment) => `<p>${comment}</p>`).join("")}</div>
      </div>
    </div>`
    )
    .join("");
}

// Upvote a post
function upvote(postTitle) {
  const post = posts.find((post) => post.title === postTitle);
  if (!post) return;
  const user = users[currentUser];
  if (user.upvotedPosts.has(postTitle)) return alert("You already upvoted this post!");
  post.votes++;
  user.upvotedPosts.add(postTitle);
  users[post.author].totalUpvotes++;
  loadPosts(post.subreddit);
}

// Add a comment
function addComment(event, postTitle) {
  if (event.key === "Enter") {
    const comment = event.target.value;
    const post = posts.find((post) => post.title === postTitle);
    post.comments.push(comment);
    event.target.value = "";
    loadPosts(post.subreddit);
  }
}

// View another user's profile
function viewProfile(username) {
  const user = users[username];
  document.getElementById("welcome-section").style.display = "none";
  document.getElementById("post-section").style.display = "none";
  document.getElementById("profile-section").style.display = "block";
  document.getElementById("profile-name").textContent = `Profile: ${username}`;
  document.getElementById("profile-subreddits").innerHTML = user.subscribedSubreddits
    .map((sub) => `<li>${sub}</li>`)
    .join("");
  document.getElementById("profile-upvotes").textContent = user.totalUpvotes;
}

// View the logged-in user's profile
function showProfile() {
  if (!currentUser) return alert("Please log in first.");
  viewProfile(currentUser);
}
