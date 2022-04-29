var express = require("express");
var natural = require("natural");
var nj = require("numjs");
tokenizer = new natural.SentenceTokenizer();

// Tokenize and clean text( remove special characters)
async function clean_text(req) {
  const { text } = req.body;

  let tok_text = tokenizer.tokenize(text);
  console.log(tok_text);
  for (let val in tok_text) {
    tok_text[val] = tok_text[val].replace(/[^a-zA-Z0-9]/g, " ");
  }
  return tok_text;
}

// function for building similarity matrix
async function build_similarity_matrix(sent, stop_words) {
  const sent_arr_length = sent.length;
  let similarity_matrix = nj.zeros([sent_arr_length, sent_arr_length]);

  // loop through sentences to create matrix
  for (let x in sent_arr_length) {
    for (let y in sent_arr_length) {
      if (x !== y) {
        similarity_matrix[x][y] = sentence_similarity(
          sent[x],
          sent[y],
          stop_words
        );
      }
    }
  }
  return similarity_matrix;
}

async function sentence_similarity(sent1, sent2, stop_words) {}

async function text_summarizer(req, res) {
  const cleaned_text = await clean_text(req);

  res.json(cleaned_text);
}

module.exports = text_summarizer;
