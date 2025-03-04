# Custom Chess
### Author: Viacheslav Rudametkin (slavoxhkaloo@gmail.com)

## Main idea

A chess platform with unique features:
- Users can create new chess pieces by defining custom movement rules and logic.
- Users can set up custom board positions using both standard and custom pieces.
- Games can be played from these custom positions.

> [!IMPORTANT]
> The project is currently a "Work in Progress." Only part of the planned functionality is implemented, and there may be bugs or incomplete features. The project will continue to be improved over time.

## Technology stack
- HTML, CSS
- JavaScript: Native, Node.js, WebSockets
- React, Next.js
- MySQL, Redis

## Overview of Implemented Features
### Piece Creating

Users can create custom chess pieces using a dedicated piece constructor. The movement of each piece is defined by combining different logic types:
- Move Logic: Standard movement rules covering most classic chess moves.
- Conditional Logic: Defines special moves by setting conditions on the board. The game checks if these conditions are met before allowing the move.
- Trigger Logic: Used for special effects (currently only for promotion). A condition is set, and when met, the corresponding action is triggered after a piece moves.
- Defend Logic: Designed for the King. A defended piece can be checked and checkmated.
- Important Move: (Work in Progress) A move that has higher priority than regular moves but lower than defensive moves (e.g., escaping check).

Below are two screenshots of the piece creation page and the "Add New Logic" form:

![Снимок экрана 2025-03-04 130158](https://github.com/user-attachments/assets/c3d6df62-b8d8-4c2d-a85c-117190e5d72c)

![Снимок экрана 2025-03-04 131331](https://github.com/user-attachments/assets/2bdee4d6-9a5c-4887-a081-23f649b445e6)


### Position Creating

Users can create custom board positions using their available pieces (default, custom, or saved). Existing positions can be used as a starting point.

![Снимок экрана 2025-03-04 131421](https://github.com/user-attachments/assets/fd6c3635-ba9f-417a-b757-92348113f1b8)


### Playing

Users can:
- Play locally (against themselves).
- Send or accept online challenges.
- Use any of their saved positions when setting up a local or online challenge.
- Accept online challenges without needing custom positions.

Below are two screenshots: one showing the Challenges Lobby and another displaying an online game with a custom start position (including a new piece):

![Снимок экрана 2025-03-04 134730](https://github.com/user-attachments/assets/91c8a33a-5af7-41c8-986a-1a38324553d7)

![image](https://github.com/user-attachments/assets/da0e4c41-acb0-4923-980c-d04bc1232d10)

