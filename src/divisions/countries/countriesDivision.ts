
const cont0: number[][] = [
    [1,3], [2,4], [5,6,7,9,12,14,18,23,26], [8], [10],
    [11], [13], [15], [16],
    [17], [19], [20],
    [21], [22], [24],
    [25, 27, 28, 35, 36, 48, 51, 59, 61, 65],//
    [29], [30], [31], [32], 
    [33], [34], [37], [38],
    [39], [40], [41], [42],
    [43, 49], [44], [45], [46],
    [47], [50], [52, 53],
    [54], [55], [56], [57],
    [58], [60], [62],
    [63, 70, 72], [64],
    [66, 71, 75], [67], [68],
    [69], [73], [74], [76], [77]
];

const cont1: number[][] = [
    [78, 79, 80, 81, 83, 84, 86, 87, 88, 89, 93, 97, 98, 105, 109, 111],
    [82, 85, 90, 91, 92, 95, 96, 99, 100, 101, 102, 103, 104, 107, 108, 110, 112, 113, 114, 116],
    [94], [106], [115, 118, 120, 121, 122, 124, 126],
    [117], [119], [123], [125], [127], [128, 129, 131, 132, 133],
    [130], [134], [135], [136],
    [137, 141], // va?
    [138], [139], [140], [142],
    [143], [144], [145], [146],
    [147, 150, 151, 157, 158, 159, 163, 164, 168, 169, 171, 172, 173, 175, 176, 177, 178, 179,
        180, 181, 183, 184, 185, 187, 188, 189, 190, 191, 192, 193, 194,
        195, 196, 197, 198, 200, 201, 202, 203, 204, 205, 206, 209, 210, 215],
    [148, 154, 155, 160, 161, 162, 170, 174, 186],// mx
    [149], [152], [153], [156], [165], [166], [167],
    [182, 199, 207, 208, 211, 212, 213, 214, 216, 217, 218, 219],
];

const cont2: number[][] = [
    [220], [221, 223, 224, 226], [222],
    [225], [227, 228, 229, 230, 231, 232, 244, 245],
    [233], [234], [235], [236, 237, 246, 248], //
    [238], [239], [240], [241], [242], [243], [247],
    [249], [250], [251], [252], [253], [254], [255], [256], [257], [258], [259], [260],
    [261], [262], [263], [264], [265], [266], [267], [268], [269], [270], [271], [272],
    [273], [274], [275], [276], [277], [278], [279], [280], [281], [282], [283], [284]
];

const cont3: number[][] = [
    [285, 286, 287, 288, 289, 290, 292, 293, 294, 298, 299],
    [291], [295, 296, 297, 300, 301, 302, 306, 307, 308, 309],
    [303], [304], [305], [310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 321],
    [320, 322, 323, 324, 325, 326], [327],
    [328, 329, 332], [330], [331],
    [333, 334, 335, 338, 339, 341, 342, 344, 345, 347, 348, 349, 350, 353, 354, 357, 358,
        362, 363, 364, 367, 368, 370, 371, 374, 375, 381, 382, 386, 392],
    [336, 340, 343, 346, 351], [337],
    [352, 356, 359, 360, 361, 366, 369, 373, 378, 379, 384, 385, 389], 
    [355], [365, 376, 377], [372], [380], [383, 387, 393, 395], [388], [390],
    [391], [394, 396], [397, 398], [399], [400], [401], [402],
    [403, 406, 407, 409, 417], [404], [405], [408], [410], 
    [411, 414, 415, 416, 418, 419, 420, 423, 424, 426, 427, 428, 431, 432, 433, 434, 435, 436, 437, 438, 
        440, 441],
    [412], [413], [421], [422], [425], [429], [430], 
    [439, 444, 451, 453, 456, 468, 464, 459, 469, 471, 482, 485],
    [442], [443], [445], [446], [447], [448], [449], [450], [452], [454],
    [455], [457], [458], [460], [461], [462], [463],
    [465], [466], [467], [470], [472], [473], [474], [475], [476], [477], [478], [479], [480], [481], [483], [484],
];

const cont4: number[][] = [
    [485, 486, 487, 488, 489, 490, 491, 492], [493],
    [494], [495, 498, 499], 
    [496], [497], [500], [501], [502],  [503], [504],
    [505], [506], [507], [508], [509],  [510], [511], [512],
    [513],
];

export default [
    cont0.map((arr: number[]) => {return arr.map((val: number) => `S${1000+val}C0`)}),
    cont1.map((arr: number[]) => {return arr.map((val: number) => `S${2000+val}C1`)}),
    cont2.map((arr: number[]) => {return arr.map((val: number) => `S${3000+val}C2`)}),
    cont3.map((arr: number[]) => {return arr.map((val: number) => `S${4000+val}C3`)}),
    cont4.map((arr: number[]) => {return arr.map((val: number) => `S${5000+val}C4`)}),
]