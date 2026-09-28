export type PublishedPage = {
  url: string;
  title: string;
  content: string;
};

export type AskPageJudgment = {
  answerability: number;
  pageRelevance: {
    page: PublishedPage;
    probability: number;
  }[];
};
