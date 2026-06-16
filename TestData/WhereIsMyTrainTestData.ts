export interface StationDetails {
  name: string;
  code: string;
}

export interface TrainDetails {
  number: string;
}

export interface WhereIsMyTrainTestData {
  fromStation: StationDetails;
  toStation: StationDetails;
  stationSearch: StationDetails;
  trainSearch: TrainDetails;
}

export const whereIsMyTrainTestData: WhereIsMyTrainTestData = {
  fromStation: {
    name: "New Delhi",
    code: "NDLS",
  },
  toStation: {
    name: "Mumbai CSMT",
    code: "CSMT",
  },
  stationSearch: {
    name: "New Delhi",
    code: "NDLS",
  },
  trainSearch: {
    number: "22308",
  },
};
