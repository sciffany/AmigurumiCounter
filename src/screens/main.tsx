import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

enum StitchNumber {
  nothing,
  _1,
  _2,
  _2tog,
}

enum StitchType {
  single,
  double,
  triple,
  hdc,
  slst
}

type Stitch = {
  stitchType: StitchType;
  stitchNumber: StitchNumber;
};

type StitchRow = Stitch[];

export function Main() {

  const [pattern, setStitches] = useState<StitchRow[]>([[]]);

  function addStitch(rowNumber: number) {
    const newPattern = [...pattern];
    newPattern[rowNumber].push({
      stitchType: StitchType.single,
      stitchNumber: StitchNumber._1,
    });
    setStitches(newPattern);
  }
  47
  function removeStitch(rowNumber: number) {
    const newPattern = [...pattern];
    newPattern[rowNumber].pop();
    setStitches(newPattern);
  }

  function addRow() {
    const newPattern = [...pattern];
    const lastRow = pattern[pattern.length-1];
    const effectiveLength = getEffectiveLength(lastRow)
    newPattern.push(Array(effectiveLength).fill({stitchType: StitchType.single, stitchNumber: StitchNumber.nothing} as Stitch));
    setStitches(newPattern);
  }

  function deleteRow() {
    if (pattern.length > 1) {
      const newPattern = [...pattern];
      newPattern.pop();
      setStitches(newPattern);
    }
  }

  function changeStitchType(rowNumber: number, stitchIndex: number) {
    setStitches((pattern: StitchRow[]) => {
      const newPattern = [...pattern];
      const newStitch = {...newPattern[rowNumber][stitchIndex]};
      newStitch.stitchNumber += 1;
      if (newStitch.stitchNumber === 4) {
        newStitch.stitchNumber = 0;
      }
      newPattern[rowNumber][stitchIndex] = newStitch;

      if (newPattern[rowNumber][stitchIndex+1]) {
        if (newStitch.stitchNumber === StitchNumber._2tog) {
          newPattern[rowNumber][stitchIndex+1] = {
            stitchType: newStitch.stitchType,
            stitchNumber: StitchNumber._2tog,
          };
        } else if (newPattern[rowNumber][stitchIndex+1].stitchNumber === StitchNumber._2tog){
          newPattern[rowNumber][stitchIndex+1] = {
            stitchType: newStitch.stitchType,
            stitchNumber: StitchNumber.nothing,
          };
        }
      }
      return newPattern;
    });
  }

  return (
    <View className='px-6 py-12'>
      <Text className="text-lg">Amigurumi Counter App</Text>
      <ScrollView>
        {pattern.map((row, rowNumber) => <>
          {rowNumber === 0 ?
            <View className="flex flex-row justify-between items-center w-full border-y-2 border-gray-300 py-2">
              <View className="flex flex-row flex-wrap justify-start flex-1">
                {row.map((stitch, stitchIndex) => {
                  return <StitchComponent key={Math.random()} rowNumber={rowNumber} stitch={stitch} stitchIndex={stitchIndex} setStitches={setStitches}/>;
                })}
              </View>
              <View className="flex flex-col">
                <AddStitchButton addStitch={addStitch} rowNumber={rowNumber} text="+"/>
                <AddStitchButton addStitch={removeStitch} rowNumber={rowNumber} text="-"/>
              </View>
              <Text className="w-1/6 text-3xl">{getEffectiveLength(row)}</Text>
            </View>
            :
            <View key={Math.random()} className="flex flex-row justify-between items-center w-full border-y-2 border-gray-300 py-2">
              <View className="flex flex-row flex-wrap w-4/5">
                {row.map((stitch, stitchIndex) => {
                  return <StitchComponent key={Math.random()} rowNumber={rowNumber} stitch={stitch} stitchIndex={stitchIndex} changeStitchType={changeStitchType}/>;
                })}
              </View>
              <Text className="w-1/6 text-3xl">{getEffectiveLength(row)}</Text>
            </View>
            }
          </>
        )}
      </ScrollView>
      <View className="flex flex-row justify-between">
        <TouchableOpacity onPress={addRow} className="bg-blue-500 rounded-full flex w-24 h-12 flex-row justify-center items-center">
          <Text className="text-white">+ Add Row</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteRow} className="bg-red-500 rounded-full flex w-24 h-12 flex-row justify-center items-center">
          <Text className="text-white">- Delete Row</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function StitchComponent({stitch, stitchIndex, rowNumber, changeStitchType}: {stitch: Stitch, stitchIndex: number, rowNumber: number, changeStitchType: Function}) {

  return <TouchableOpacity onPress={()=>{changeStitchType(rowNumber, stitchIndex)}} className="flex flex-row">
    <View className={`h-8 w-8 ${getColourForStitchNumber(stitch.stitchNumber)} rounded-full flex flex-row justify-center items-center`}>
      <Text className="text-white">{stitchNumberToString(stitch.stitchNumber)}</Text>
    </View>
  </TouchableOpacity>
}

function AddStitchButton({addStitch, rowNumber, text}: {
  addStitch: (rowNumber: number) => void;
  rowNumber: number;
  text: string;
}) {
  return <TouchableOpacity onPress={()=>addStitch(rowNumber)} className="flex flex-row">
    <View className="h-8 w-8 bg-gray-400 rounded-full flex flex-row justify-center items-center">
      <Text className="text-white">{text}</Text>
    </View>
  </TouchableOpacity>
}

function stitchNumberToString(stitchNumber: StitchNumber) {
  switch(stitchNumber) {
    case StitchNumber._1:
      return "1sc";
    case StitchNumber._2:
      return "2sc";
    case StitchNumber._2tog:
      return "2tog";
    case StitchNumber.nothing:
      return "";
    default:
      return "";
  }
}

function getEffectiveLength(stitchRow: StitchRow) {
  let effectiveLength = 0;
  for (let i = 0; i < stitchRow.length; i++) {
    if (stitchRow[i].stitchNumber === StitchNumber.nothing) {
      effectiveLength += 0;
    }
    if (stitchRow[i].stitchNumber === StitchNumber._1) {
      effectiveLength += 1;
    }
    if (stitchRow[i].stitchNumber === StitchNumber._2) {
      effectiveLength += 2;
    }
    if (stitchRow[i].stitchNumber === StitchNumber._2tog) {
      effectiveLength += 0.5;
    }
  }
  return effectiveLength;

}

function getColourForStitchNumber(stitchNumber: StitchNumber) {
  switch(stitchNumber) {
    case StitchNumber._1:
      return "bg-blue-500";
    case StitchNumber._2:
      return "bg-blue-900";
    case StitchNumber._2tog:
      return "bg-blue-200";
    case StitchNumber.nothing:
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }

}