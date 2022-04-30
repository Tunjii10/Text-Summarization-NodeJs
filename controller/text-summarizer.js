var express = require("express");
var natural = require("natural");
var nj = require("numjs");
var tokenizer = new natural.SentenceTokenizer();
var tokenizerWord = new natural.WordTokenizer();
var similarity = require("compute-cosine-similarity");

// Tokenize and clean text( remove special characters)
async function clean_text(req) {
  try {
    const { text } = req.body;

    let tok_text = tokenizer.tokenize(text);
    for (let val in tok_text) {
      tok_text[val] = tok_text[val].replace(/[^a-zA-Z0-9]/g, " ");
    }
    return tok_text;
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
    if (!stop_words) {
      const stop_words = [];
    }
    let words1 = tokenizerWord.tokenize(sent1);
    let words2 = tokenizerWord.tokenize(sent2);

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

async function text_summarizer(req, res) {
  try {
    const cleaned_text = await clean_text(req);
    const sent_sim_matrix = await build_similarity_matrix(cleaned_text, []);
    res.json(sent_sim_matrix);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = text_summarizer;
