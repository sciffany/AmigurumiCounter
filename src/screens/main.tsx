import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Button } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [pattern, setPattern] = useState(Array(0).fill(Math.random()));
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [saveModalShown, setSaveModalShown] = useState(false);
  const [loadModalShown, setLoadModalShown] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [startRow, setStartRow] = useState(1);

  useEffect(()=>{
    AsyncStorage.getItem(`@amigurumi/filenames`).then((projectNames)=>{
      if (projectNames) {
        setProjectNames(JSON.parse(projectNames));
      }
    })
  }, []);

  async function addRow() {
    const previousRow = await AsyncStorage.getItem(`@amigurumi/${pattern.length-1}`);

    if (previousRow) {
      const prevRowJson = JSON.parse(previousRow) as Stitch[];
      const effectiveLength = getEffectiveLength(prevRowJson);

      const previouslySavedRow = await AsyncStorage.getItem(`@amigurumi/${pattern.length}`);
      const previouslySavedRowJson = null ? JSON.parse(previouslySavedRow ?? "[]") as Stitch[]: [];

      if (previouslySavedRowJson.length === 0) {
        await AsyncStorage.setItem(
          `@amigurumi/${pattern.length}`,
          JSON.stringify(Array(effectiveLength).fill(
            [
              {
                stitchType: StitchType.single,
                stitchNumber: StitchNumber.nothing,
              }
            ]
          ))
        );
      }
    }
    setPattern([...pattern, Math.random()]);
  }

  async function removeRow() {
    setPattern(pattern.slice(0, pattern.length-1));
    try {
      await AsyncStorage.removeItem(`@amigurumi/${pattern.length-1}`)
    } catch (e) {
    }
  }

  async function save() {
    await AsyncStorage.setItem(`@amigurumi/filenames`, JSON.stringify(
      Array.from(new Set([...projectNames, projectName])))
    );

    await AsyncStorage.setItem(`@amigurumi/${projectName}/size`, `${pattern.length}`);
    await AsyncStorage.setItem(`@amigurumi/${projectName}/startRow`, `${startRow}`);

    await Promise.all(Array(pattern.length).fill(0).map(async (row, rowIndex) => {
      const rowToSave = await AsyncStorage.getItem(`@amigurumi/${rowIndex}`)
      await AsyncStorage.setItem(`@amigurumi/${projectName}/${rowIndex}`, rowToSave ?? "");
    }))
    setSaveModalShown(false);
  }

  async function load(projectName: string) {
    const loadedPatternLength = parseInt(await AsyncStorage.getItem(`@amigurumi/${projectName}/size`) ?? "0");
    const loadedStartRow = parseInt(await AsyncStorage.getItem(`@amigurumi/${projectName}/startRow`) ?? "1");

    await Promise.all(Array(loadedPatternLength).fill(0).map(async (row, rowIndex) => {
      const loadedRow = await AsyncStorage.getItem(`@amigurumi/${projectName}/${rowIndex}`)
      await AsyncStorage.setItem(`@amigurumi/${rowIndex}`, loadedRow ?? "");
    }))
    
    setPattern(Array(loadedPatternLength).fill(0).map(_=>Math.random()));
    setLoadModalShown(false);
    setStartRow(loadedStartRow);
  }

  return (
    <>
      {saveModalShown &&
        <Modal className="flex flex-col h-full justify-center">
          <Text>Input Project Name Below:</Text>
          <TextInput onChangeText={setProjectName}></TextInput>
          <Button onPress={save} title="Save"></Button>
          <Button color="gray" onPress={()=>setSaveModalShown(false) } title="Cancel"></Button>
        </Modal>
      }
      {loadModalShown &&
        <Modal className="flex flex-row">
          <Text>Load Project</Text>
          {projectNames.map((projectName, index) => {
            return <View className="flex flex-row">
              <TouchableOpacity className="flex-1 flex flex-row items-center bg-blue-500" key={Math.random()} onPress={()=>load(projectName)}>
                <Text className="text-white">{projectName}</Text>
              </TouchableOpacity>
              <Button onPress={
                async ()=>{
                  setSelectedProjectName(projectName);
                  setDeleteModal(true);
                }}
              color="red" title="Delete"></Button>
            </View>
          })}
          <Button color="gray" onPress={()=>{setLoadModalShown(false)} } title="Cancel"></Button>
        </Modal>
      }
      {deleteModal && <Modal className="flex flex-row">
        <Text>Are you sure you want to delete {selectedProjectName} project?</Text>
        <Button color="red" onPress={()=>{
          setDeleteModal(false)
          setProjectNames(projectNames.filter((projectName)=>projectName !== selectedProjectName));
          AsyncStorage.setItem(`@amigurumi/filenames`, JSON.stringify(projectNames.filter((projectName)=>projectName !== selectedProjectName)));
        } } title="Delete"></Button>
        <Button color="gray" onPress={()=>{setDeleteModal(false)} } title="Cancel"></Button>
      </Modal>
      }
      <View className='p-6 pt-12'>
        <View className="flex flex-row items-center justify-center">
          <Text className="text-lg">Amigurumi Counter App</Text>
        </View>
        <Text>Starting Row: </Text><TextInput className="border-2 p-2 w-24"
          onChangeText={(value)=>setStartRow(parseInt(value))
        }
        >
        </TextInput>
        <ScrollView>
          {
            pattern.map((randomNumber, rowIndex) => {
              return <StitchRow rowName={(startRow+rowIndex).toString()} key={randomNumber} rowIndex={rowIndex}/>
            })
          }
        </ScrollView>
        <View className="flex flex-row justify-center">
          <TouchableOpacity onPress={addRow} className="bg-blue-500 rounded-full flex w-24 h-12 flex-row justify-center items-center">  
            <Text  className="text-white">+ Add Row</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={removeRow} className="bg-red-500 rounded-full flex w-24 h-12 flex-row justify-center items-center">
            <Text  className="text-white">- Delete Row</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setSaveModalShown(true)} className="bg-green-500 rounded-full flex w-24 h-12 flex-row justify-center items-center">
            <Text  className="text-white">Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={
            async ()=>{
              setLoadModalShown(true)
              await AsyncStorage.getItem(`@amigurumi/filenames`).then((projectNames)=>{
                if (projectNames) {
                  console.log(projectNames);
                  setProjectNames(JSON.parse(projectNames));
                }
            })}
          } className="bg-gray-500 rounded-full flex w-24 h-12 flex-row justify-center items-center">
            <Text  className="text-white">Load</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
  
};

function StitchRow({rowIndex, rowName}: {rowIndex: number, rowName: string}) {
  const [stitchRow, setStitchRow] = useState<Stitch[]>([]);
  const getStitchRowFromStorage = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(`@amigurumi/${rowIndex}`)
      return jsonValue != null ? JSON.parse(jsonValue) as Stitch[]: [];
    } catch(e) {
      return null;
    }
  }

  useEffect(()=>{
    getStitchRowFromStorage().then((stitchRow)=>{
      if (stitchRow && stitchRow.length > 0) {
        setStitchRow(stitchRow);
      }
    });
  }, [rowIndex])

  async function addStitch() {
    setStitchRow(stitchRow=>
      [...stitchRow, {
        stitchType: StitchType.single,
        stitchNumber: StitchNumber._1,
      }]);
    await storeData([...stitchRow, {
      stitchType: StitchType.single,
      stitchNumber: StitchNumber._1,
    }]);
  }
  
  async function removeStitch() {
    setStitchRow(stitchRow => stitchRow.slice(0, stitchRow.length-1));
    await storeData(stitchRow.slice(0, stitchRow.length-1));
  }

  const storeData = async (stitchRow: Stitch[]) => {
    try {
      const jsonValue = JSON.stringify(stitchRow)
      await AsyncStorage.setItem(`@amigurumi/${rowIndex}`, jsonValue)
    } catch (e) {
    }
  }

  async function changeStitchType(stitchIndex: number) {
    const updateStitchType =  (stitchRow: StitchRow) => {
      const newStitchRow = [...stitchRow];
      const newStitch = {...stitchRow[stitchIndex]};
      newStitch.stitchNumber += 1;
      if (newStitch.stitchNumber === 4) {
        newStitch.stitchNumber = 0;
      }
      if (Number.isNaN(newStitch.stitchNumber)) {
        newStitch.stitchNumber = 1;
      }

      if (newStitchRow[stitchIndex+1]) {
        if (newStitch.stitchNumber === StitchNumber._2tog) {
          newStitchRow[stitchIndex+1] = {
            stitchType: newStitch.stitchType,
            stitchNumber: StitchNumber._2tog,
          };
        } else if (newStitchRow[stitchIndex+1].stitchNumber === StitchNumber._2tog){
          newStitchRow[stitchIndex+1] = {
            stitchType: newStitch.stitchType,
            stitchNumber: StitchNumber.nothing,
          };
        }
      }

      newStitchRow[stitchIndex] = newStitch;
      return newStitchRow;
    }
    setStitchRow(updateStitchType);
    await storeData(updateStitchType(stitchRow));
  }

  return <><Text>Row: {rowName}</Text><View className="flex flex-row justify-between items-center w-full border-b-2 border-gray-300 py-2">
          <View className="flex flex-row flex-wrap justify-start flex-1">
            {stitchRow.map((stitch, stitchIndex)=>{
              return <StitchComponent key={Math.random()} stitchIndex={stitchIndex} stitch={stitch} changeStitchType={changeStitchType}/>;
            })}
          </View>
          <View className="flex flex-col">
            <AddStitchButton addStitch={addStitch} text="+"/>
            <AddStitchButton addStitch={removeStitch} text="-"/>
          </View>
          <Text className="w-1/6 text-3xl">{getEffectiveLength(stitchRow)}</Text>
        </View>
        </>
}

function StitchComponent({changeStitchType, stitchIndex, stitch}: {changeStitchType:(stitchIndex: number) => void, stitchIndex: number, stitch: Stitch}) {
  return <TouchableOpacity
            onPress={()=>changeStitchType(stitchIndex)}
            className={`flex flex-row justify-center items-center w-8 h-8 rounded-lg ${getColourForStitchNumber(stitch.stitchNumber)}`}>
    <Text className="text-xl text-white">{stitchNumberToString(stitch.stitchNumber)}</Text>
  </TouchableOpacity>
}

function AddStitchButton({addStitch, text}: {
  addStitch: () => void;
  text: string;
}) {
  return <TouchableOpacity onPress={addStitch} className="flex flex-row">
    <View className="h-8 w-8 bg-gray-400 rounded-full flex flex-row justify-center items-center">
      <Text className="text-white">{text}</Text>
    </View>
  </TouchableOpacity>
}

function stitchNumberToString(stitchNumber: StitchNumber) {
  switch(stitchNumber) {
    case StitchNumber._1:
      return "1";
    case StitchNumber._2:
      return "2";
    case StitchNumber._2tog:
      return "2t";
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