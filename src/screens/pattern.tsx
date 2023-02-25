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
                {/* {row.map((stitch, stitchIndex) => {
                  return <StitchComponent key={Math.random()} rowNumber={rowNumber} stitch={stitch} stitchIndex={stitchIndex} changeStitchType={changeStitchType}/>;
                })} */}
              </View>
              <Text className="w-1/6 text-3xl">{getEffectiveLength(row)}</Text>
            </View>
            }
          </>
        )}