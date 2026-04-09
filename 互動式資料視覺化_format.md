Interactive Data Visualization
Using AI to analyse and synthesise large datasets, enhancing visual storytelling to create more engaging content that reaches a broader audience.
Prerequisites
Article Content & Metadata 
Full text of past articles, headlines, tags, publication date, author, category
External Structured Data 
Government open data, statistical datasets, geographic and regional data
External Unstructured Data
Social media posts, third-party data providers
Domain Expert Access 
Subject matter experts available for feature definition and model validation
Modelling Processes & Model Outputs
Use Case
Required Data
Modelling Process
Model Output
Reference Case
Data-Driven Visual Storytelling
1 + 2
Structured data cleaning, feature extraction, interactive chart generation
Embeddable interactive data visualisations
Ebola Virus Hotspot Map
Sentiment Analysis Visualisation
1 + 3
Spam filtering, full-article semantic encoding, sentiment classification
Sentiment trend charts by political figure
Election Social Media Sentiment Analysis
Predictive Visual Insights
1 + 2 + 4
Feature engineering, prediction models (logistic regression / tree-based), expert validation
Predictive hotspot maps with confidence intervals
Ebola Virus Hotspot Prediction

Technical Assessments
For relatively accurate predictions in Sentiment Analysis, the challenges around model selection are significant, including the following:
Evaluation set construction: A standardized test set must be established, covering common cases and edge cases with human annotations, in order to evaluate the accuracy of different models.
Model selection: Sentiment models are typically trained on predefined datasets such as tweets; differences in context can significantly affect model performance. In addition, sentiment models come with predefined labels (e.g., happy, angry) that may not align with actual requirements. A recommended approach is to use an LLM for classification. For volumes below the millions level, the cost is not prohibitive 1,2.
Predictive insights are highly dependent on domain knowledge, requiring deep involvement from domain experts at every stage:
Data collection: Identifying what data is useful for making judgments. In infectious disease prediction, for example, different transmission mechanisms may call for different types of data.
Feature engineering: Injecting prior knowledge to help the model fit more efficiently is a practical approach, especially with smaller datasets (e.g., effectively constraining the parameter space). Examples include assigning higher weights to more recent data, or combining two different signals such as CTR as a representative feature.
Performance evaluation and calibration: The ability to calibrate both data and models based on observed results when comparing the outcomes of different models.
Using generative models can reduce reliance on domain experts, as distribution parameters can be designed based on historically similar events.
Responsive design and performance: Taiwanese readers consume news heavily on mobile devices, making the interaction experience and loading speed of interactive visualizations on mobile a practical challenge that must be addressed.
