"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let favStoriesList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  if (currentUser){
    favStoriesList = new StoryList(currentUser.favorites);
  }
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <div class="fav-btn-container not-favorite"></div>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $('.fav-btn-container').on('click', event => {
    favBtnHandler(event)
  });
  // console.log(currentUser);
  // console.log(currentUser.favorites);
  if (currentUser){
    inidcateFavoritesOnLoad;
  }
  $allStoriesList.show();
}

async function addNewStory(e){
  e.preventDefault();
  let title = $('#new-story-title').val();
  let author = $('#new-story-author').val();
  let url = $('#new-story-url').val();
  const story = {
    title,
    author,
    url
  }
  const newStory = await storyList.addStory(currentUser, story);
  storyList.stories.unshift(newStory);
  hidePageComponents();
  $allStoriesList.show();
}
$submitForm.on('submit', e => addNewStory(e));

//adds/removes stories from user's favorites list and updates UI accordingly
async function favBtnHandler(event){
  const target = $(event.target);
  const classList = target.attr("class").split(/\s+/);
  if (classList.includes('not-favorite')){
    target.removeClass('not-favorite').addClass('favorite');
    let storyId = target.parent().attr('id');
    await currentUser.addFavorite(storyId);
  } else {
    target.removeClass('favorite').addClass('not-favorite');
    let storyId = target.parent().attr('id');
    await currentUser.removeFavorite(storyId);
  }
}

//goes through storyList.stories and checks to see which stories are on the user's favorites list and updates UI accordingly
function inidcateFavoritesOnLoad(){
  console.debug('indicateFavoritesOnLoad');
  let favoriteIds = currentUser.favorites.map(fav => {
    return fav.storyId;
  });
  storyList.stories.forEach(story => {
    if (favoriteIds.includes(story.storyId)){
      $(`#${story.storyId} .fav-btn-container`).removeClass('not-favorite').addClass('favorite');
    }    
  });
}

//adds content to $favStoriesList so that it can be shown when needed
async function createFavStories(){
  let favs = await favStoriesList.stories;
  for (let story of favs) {
    const $story = generateStoryMarkup(story);
    console.log($story);
    $favStoriesList.append($story);
  }
  $('.fav-btn-container').on('click', event => {
    favBtnHandler(event)
  });
  $('.fav-btn-container').removeClass('not-favorite').addClass('favorite');
}