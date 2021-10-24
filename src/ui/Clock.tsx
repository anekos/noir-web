import React, {useState} from 'react'

import strftime from 'strftime'

import Information from './Information'
import useInterval from '../use-interval'


function currentTime(): string {
  return strftime('%Y-%m-%d (%a) %H:%M')
}


export default function Clock() {
  const [time, setTime] = useState<string>(currentTime())

  useInterval(
    1,
    () => setTime(currentTime()),
  )

  return (
    <Information className="absolute right-0 bottom-0 hidden lg:block">
      { time }
    </Information>
  )
}
