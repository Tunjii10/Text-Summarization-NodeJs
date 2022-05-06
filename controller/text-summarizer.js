var express = require("express");
var natural = require("natural");
var nj = require("numjs");
var stopwords_array = require("./stopword.js");
var tokenizer = new natural.SentenceTokenizer();
var tokenizerWord = new natural.WordTokenizer();
var similarity = require("compute-cosine-similarity");

// Tokenize and clean text( remove special characters)
async function clean_text(req) {
  try {
    const { text } = req.body;
    let tok_text = [];
    let orig_tok_text = tokenizer.tokenize(text);
    for (let val in orig_tok_text) {
      tok_text[val] = orig_tok_text[val].replace(/[^a-zA-Z0-9]/g, " ");
    }
    return [tok_text, orig_tok_text];
  } catch (e) {
    throw e;
  }
}

// function for building similarity matrix
async function build_similarity_matrix(sent, stop_words) {
  try {
    const sent_arr_length = sent.length;
    let similarity_matrix = nj.zeros([sent_arr_length, sent_arr_length]);
    // loop through sentences to create matrix
    for (let x = 0; x < sent_arr_length; x++) {
      for (let y = 0; y < sent_arr_length; y++) {
        if (x !== y) {
          let sent_sim_result = await sentence_similarity(
            sent[x],
            sent[y],
            stop_words
          );
          similarity_matrix.set(x, y, sent_sim_result);
        }
      }
    }
    return similarity_matrix.tolist();
  } catch (e) {
    throw e;
  }
}

async function sentence_similarity(sent1, sent2, stop_words) {
  try {
    let words1 = tokenizerWord.tokenize(sent1);
    let words2 = tokenizerWord.tokenize(sent2);

    for (let x in words1) {
      words1[x] = words1[x].toLowerCase();
    }

    for (let x in words2) {
      words2[x] = words2[x].toLowerCase();
    }

    const all_words = [...new Set([...words1, ...words2])];

    let vector1 = nj.zeros([all_words.length]);
    let vector2 = nj.zeros([all_words.length]);

    for (let x in words1) {
      if (!stop_words.includes(words1[x])) {
        let val = vector1.get([all_words.indexOf(words1[x])]);
        vector1.set([all_words.indexOf(words1[x])], val + 1);
      }
    }
    for (let x in words2) {
      if (!stop_words.includes(words2[x])) {
        let val = vector2.get([all_words.indexOf(words2[x])]);
        vector2.set([all_words.indexOf(words2[x])], val + 1);
      }
    }
    const cos_similarity = similarity(vector1.tolist(), vector2.tolist());
    return cos_similarity;
  } catch (e) {
    throw e;
  }
}

async function page_rank(sim_matrix) {
  // constants
  const damping = 0.85;
  const min_diff = 0.00001;
  const steps = 100;

  let pr_vector = nj.ones([sim_matrix.length]);
  let previous_pr = 0;
  for (let val = 0; val < steps; val++) {
    pr_vector = nj.multiply(
      nj.dot(sim_matrix, pr_vector),
      1 - damping + damping
    );
    if (Math.abs(previous_pr - nj.sum(pr_vector)) < min_diff) {
      break;
    } else {
      previous_pr = nj.sum(pr_vector);
    }
  }
  return pr_vector;
}

async function get_top_sentence(
  pr_vector,
  sentences,
  number = Math.floor(sentences.length / 2)
) {
  let top_sentence = [];
  let sorted_pr;
  let pr_vector_arr = pr_vector.tolist();
  if (pr_vector_arr) {
    sorted_pr = sentences
      .map((item, index) => [pr_vector_arr[index], item]) // add the args to sort by
      .sort(([arg1], [arg2]) => arg1 - arg2) // sort by the args
      .map(([, item]) => item); // extract the sorted items
  }
  sorted_pr.reverse();
  console.log(sorted_pr);
  for (let x = 0; x < number; x++) {
    top_sentence.push(sorted_pr[x]);
  }
  return top_sentence;
}
async function text_summarizer(req, res) {
  try {
    const [cleaned_text, orig_text_sent] = await clean_text(req);
    const sent_sim_matrix = await build_similarity_matrix(
      cleaned_text,
      stopwords_array
    );
    const page_vector = await page_rank(sent_sim_matrix);
    const extracted_sentence = await get_top_sentence(
      page_vector,
      orig_text_sent
    );
    res.json(extracted_sentence);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = text_summarizer;
