export const pawnFirstLongMove = {
    "type":"conditional",
    "name": "Pawn first move - long",
    "params": {
        "configSquares":[
            {
                "position":{"row":0,"column":0},
                "pieceCfg":{"movesDone":"[Enter]","movesDoneValue":0},
                "squareCfg":{},
                "resultCfg":{"type":"clear"}
            },
            {
                "position":{"row":1,"column":0},
                "pieceCfg":{"whitelist":[null]},
                "squareCfg":{},
                "resultCfg":{"type":"clear"}
            },
            {
                "position":{"row":2,"column":0},
                "pieceCfg":{"whitelist":[null]},
                "squareCfg":{},
                "resultCfg":{"type":"piece-here"}
            }
        ],
        "resultType":"position",
        "flip": {
            "horizontal": false,
            "vertical": false
        }
    }
}

export const shortCastles = {
    "type": "conditional",
    "name" : "O-O",
    "params": {
      "configSquares": [
        {
          "position": {
            "row": 0,
            "column": 0
          },
          "pieceCfg": {
            "movesDone": "[Enter]",
            "movesDoneValue": 0
          },
          "squareCfg": {
            "attacked": "no"
          },
          "resultCfg": {
            "type": "clear"
          }
        },
        {
          "position": {
            "row": 0,
            "column": 1
          },
          "pieceCfg": {
            "whitelist": [
              null
            ]
          },
          "squareCfg": {
            "attacked": "no"
          },
          "resultCfg": {
            "type": "ally-piece",
            "value": "rook"
          }
        },
        {
          "position": {
            "row": 0,
            "column": 2
          },
          "pieceCfg": {
            "whitelist": [
              null
            ]
          },
          "squareCfg": {
            "attacked": "no"
          },
          "resultCfg": {
            "type": "piece-here"
          }
        },
        {
          "position": {
            "row": 0,
            "column": 3
          },
          "pieceCfg": {
            "whitelist": [
              "rook"
            ],
            "color": "ally",
            "movesDone": "[Enter]",
            "movesDoneValue": 0
          },
          "squareCfg": {},
          "resultCfg": {
            "type": "clear"
          }
        }
      ],
      "resultType": "position",
      "flip": {
        "horizontal": true,
        "vertical": false
      }
    }
  }

export const longCastles = {
  "type": "conditional",
  "name": "O-O-O",
  "params": {
    "configSquares": [
      {
        "position": {
          "row": 0,
          "column": 0
        },
        "pieceCfg": {
          "movesDone": "[Enter]",
          "movesDoneValue": 0
        },
        "squareCfg": {
          "attacked": "no"
        },
        "resultCfg": {
          "type": "clear"
        }
      },
      {
        "position": {
          "row": 0,
          "column": -1
        },
        "pieceCfg": {
          "whitelist": [
            null
          ]
        },
        "squareCfg": {
          "attacked": "no"
        },
        "resultCfg": {
          "type": "ally-piece",
          "value": "rook"
        }
      },
      {
        "position": {
          "row": 0,
          "column": -2
        },
        "pieceCfg": {
          "whitelist": [
            null
          ]
        },
        "squareCfg": {
          "attacked": "no"
        },
        "resultCfg": {
          "type": "piece-here"
        }
      },
      {
        "position": {
          "row": 0,
          "column": -3
        },
        "pieceCfg": {
          "whitelist": [
            null
          ]
        },
        "squareCfg": {},
        "resultCfg": {
          "type": "clear"
        }
      },
      {
        "position": {
          "row": 0,
          "column": -4
        },
        "pieceCfg": {
          "whitelist": [
            "rook"
          ],
          "color": "ally",
          "movesDone": "[Enter]",
          "movesDoneValue": 0
        },
        "squareCfg": {},
        "resultCfg": {
          "type": "clear"
        }
      }
    ],
    "resultType": "position",
    "flip": {
      "horizontal": true,
      "vertical": false
    }
  }
}


export const enPassant = {
  "type": "conditional",
  "name": "En passant",
  "params": {
    "configSquares": [
      {
        "position": {
          "row": 0,
          "column": 0
        },
        "pieceCfg": {},
        "squareCfg": {},
        "resultCfg": {
          "type": "clear"
        }
      },
      {
        "position": {
          "row": 0,
          "column": 1
        },
        "pieceCfg": {
          "whitelist": [
            "pawn"
          ],
          "color": "enemy",
          "movesDone": "[Enter]",
          "movesDoneValue": 1,
          "lastMoveAgo": "[Enter]",
          "lastMoveAgoValue": 1
        },
        "squareCfg": {},
        "resultCfg": {
          "type": "clear"
        }
      },
      {
        "position": {
          "row": 1,
          "column": 1
        },
        "pieceCfg": {
          "whitelist": [
            null
          ]
        },
        "squareCfg": {},
        "resultCfg": {
          "type": "piece-here"
        }
      },
      {
        "position": {
          "row": 2,
          "column": 1
        },
        "pieceCfg": {
          "blacklist": []
        },
        "squareCfg": {},
        "resultCfg": {}
      },
      {
        "position": {
          "row": 3,
          "column": 1
        },
        "pieceCfg": {
          "blacklist": []
        },
        "squareCfg": {},
        "resultCfg": {}
      }
    ],
    "resultType": "position",
    "flip": {
      "horizontal": true,
      "vertical": false
    }
  }
}


export const pawnPromotion = {
  "type": "trigger",
  "name": "Promotion",
  "params": {
    "condition": {
      "type": "row",
      "value": 8
    },
    "consequence": {
      "type": "transformation",
      "value": [
        "rook",
        "bishop",
        "knight",
        "queen"
      ]
    }
  }
};