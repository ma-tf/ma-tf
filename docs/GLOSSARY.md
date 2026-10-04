# m4t.tf

A personal website that publishes its content twice: as pages for people, and as a
discovery surface for agents. This glossary names the concepts of that surface.

## Language

### Content

**Page**:
An HTML document written for a human reader.
_Avoid_: resource, route

**Page inventory**:
The single list of the site's pages and their kinds that the agent guide, the
sitemap and the decision gate derive their page lists from.
_Avoid_: page list, route table

**Discovery resource**:
A machine-readable artefact the site publishes at a fixed path.
_Avoid_: endpoint, file, document

**Resource catalogue**:
The single list of discovery resources the site publishes.
_Avoid_: registry, manifest

**Canonical resource**:
A discovery resource served at its own path in its declared media type, as opposed
to one of its other forms.
_Avoid_: original, source

**Markdown twin**:
The markdown form of a page or discovery resource.
_Avoid_: markdown copy, md version

**Section guide**:
A discovery resource that indexes one area of the site, such as its writing or
machine-readable surface, so an agent can fetch scoped context instead of the
whole site.
_Avoid_: subsection llms, partial index, section llms.txt

### Audience

**Agent**:
A machine consumer that reads the discovery surface to answer questions about the
site's owner.
_Avoid_: bot, crawler, user

**Agent Skill**:
A capability document the site publishes for agents.
_Avoid_: tool, plugin, prompt

**Agent capability**:
An action the site publishes for agents to invoke, as opposed to a discovery
resource to read.
_Avoid_: endpoint, API, tool

### Ask

**Ask**:
A visitor's question to the site, answered from its published content rather than
from open-ended model knowledge.
_Avoid_: query, prompt, chat

**Decision gate**:
The stage of an ask that decides whether the question is answerable from published
content and which content answers it, before any prose is written.
_Avoid_: router, classifier, filter

**Answerer**:
The stage of an ask that writes the prose from the content the decision gate
selected.
_Avoid_: generator, model, completion
